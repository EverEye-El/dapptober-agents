// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
import {EncryptedConfidant} from '../src/EncryptedConfidant.sol';
import {CofheTest} from '@cofhe/foundry-plugin/CofheTest.sol';
import {CofheClient} from '@cofhe/foundry-plugin/CofheClient.sol';
import {MockCoFHEAddressBook} from '@cofhe/mock-contracts/contracts/MockCoFHEAddressBook.sol';
import {MockTaskManager} from '@cofhe/mock-contracts/contracts/MockTaskManager.sol';
import {MockACL} from '@cofhe/mock-contracts/contracts/MockACL.sol';
import {ACPTimestampRevoker} from '@cofhe/mock-contracts/contracts/ACPTimestampRevoker.sol';
import {ACPShareRegistry} from '@cofhe/mock-contracts/contracts/ACPShareRegistry.sol';
import {MockERC1967Proxy} from '@cofhe/mock-contracts/contracts/MockERC1967Proxy.sol';
import {MockZkVerifier} from '@cofhe/mock-contracts/contracts/MockZkVerifier.sol';
import {MockThresholdNetwork} from '@cofhe/mock-contracts/contracts/MockThresholdNetwork.sol';
import {MockZkVerifierSigner} from '@cofhe/foundry-plugin/MockZkVerifierSigner.sol';
import {MockThresholdNetworkSigner} from '@cofhe/foundry-plugin/MockThresholdNetworkSigner.sol';
import {ACP} from '@cofhe/mock-contracts/contracts/Permissioned.sol';
import {ZK_VERIFIER_SIGNER_ADDRESS,DECRYPT_RESULT_SIGNER_ADDRESS} from '@cofhe/mock-contracts/contracts/MockCoFHE.sol';
import {COFHE_ADDRESS_BOOK,TASK_MANAGER_ID,externalEuint64,euint64,eaddress} from '@fhenixprotocol/cofhe-contracts/FHE.sol';
contract EncryptedConfidantTest is CofheTest {
 EncryptedConfidant room;CofheClient alice;CofheClient bob;uint256 id;
 // Official CofheTest deployment sequence, with fully qualified artifact paths for this monorepo.
  function deployDay18Mocks() public {
    // 0. Address Book (FHE.sol resolves the Task Manager through it)
    deployCodeTo('../node_modules/@cofhe/mock-contracts/contracts/MockCoFHEAddressBook.sol:MockCoFHEAddressBook', COFHE_ADDRESS_BOOK);
    mockAddressBook = MockCoFHEAddressBook(COFHE_ADDRESS_BOOK);
    vm.label(address(mockAddressBook), 'MockCoFHEAddressBook');

    // 1. Task Manager
    deployCodeTo('../node_modules/@cofhe/mock-contracts/contracts/MockTaskManager.sol:MockTaskManager', MOCKS_TASK_MANAGER_ADDRESS);
    mockTaskManager = MockTaskManager(MOCKS_TASK_MANAGER_ADDRESS);
    mockAddressBook.setTm(TASK_MANAGER_ID, MOCKS_TASK_MANAGER_ADDRESS);
    mockTaskManager.initialize(TM_ADMIN);
    mockTaskManager.setLogOps(false);
    // Exclude mock-only plaintext replication from gas metering so reported gas is closer
    // to the real task manager. Requires cheatcode access, which etched contracts don't
    // inherit from the test contract.
    vm.allowCheatcodes(MOCKS_TASK_MANAGER_ADDRESS);
    mockTaskManager.setMockGasExcluded(true);
    vm.label(address(mockTaskManager), 'MockTaskManager');

    // 2. ACL (non-fixed deploy so constructor runs and EIP712 domain is set)
    mockAcl = new MockACL();
    mockAcl.setTaskManager(address(mockTaskManager));
    vm.label(address(mockAcl), 'MockACL');

    // ACP (ACP V3): default revoker (verification inherited by the ACL)
    acpRevoker = new ACPTimestampRevoker();
    vm.label(address(acpRevoker), 'ACPTimestampRevoker');
    mockAcl.setDefaultRevokerContract(address(acpRevoker));

    // ACP: on-chain hand-off for sharing ACPs
    // the production contract (upgradeable): behind a proxy, initialized with this test as admin
    ACPShareRegistry acpShareRegistryImpl = new ACPShareRegistry();
    acpShareRegistry = ACPShareRegistry(
      address(
        new MockERC1967Proxy(
          address(acpShareRegistryImpl),
          abi.encodeCall(ACPShareRegistry.initialize, (address(this)))
        )
      )
    );
    vm.label(address(acpShareRegistry), 'ACPShareRegistry');
    mockAcl.setShareRegistry(address(acpShareRegistry));

    // 3. Link Task Manager <-> ACL, configure signers
    vm.startPrank(TM_ADMIN);
    mockTaskManager.setACLContract(address(mockAcl));
    mockTaskManager.setSecurityZoneMin(0);
    mockTaskManager.setSecurityZoneMax(1);
    mockTaskManager.setVerifierSigner(ZK_VERIFIER_SIGNER_ADDRESS);
    mockTaskManager.setDecryptResultSigner(DECRYPT_RESULT_SIGNER_ADDRESS);
    vm.stopPrank();

    // 4. Fund ZK Verifier Signer
    vm.deal(ZK_VERIFIER_SIGNER_ADDRESS, 10 ether);

    // 5. ZK Verifier
    deployCodeTo('../node_modules/@cofhe/mock-contracts/contracts/MockZkVerifier.sol:MockZkVerifier', ZK_VERIFIER_ADDRESS);
    mockZkVerifier = MockZkVerifier(ZK_VERIFIER_ADDRESS);
    vm.label(address(mockZkVerifier), 'MockZkVerifier');

    // 6. ZK Verifier Signer
    deployCodeTo('../node_modules/@cofhe/foundry-plugin/contracts/MockZkVerifierSigner.sol:MockZkVerifierSigner', ZK_VERIFIER_SIGNER_ADDRESS);
    mockZkVerifierSigner = MockZkVerifierSigner(ZK_VERIFIER_SIGNER_ADDRESS);
    vm.label(address(mockZkVerifierSigner), 'MockZkVerifierSigner');

    // 7. Threshold Network
    deployCodeTo('../node_modules/@cofhe/mock-contracts/contracts/MockThresholdNetwork.sol:MockThresholdNetwork', THRESHOLD_NETWORK_ADDRESS);
    mockThresholdNetwork = MockThresholdNetwork(THRESHOLD_NETWORK_ADDRESS);
    mockThresholdNetwork.initialize(address(mockTaskManager), address(mockAcl));
    vm.label(address(mockThresholdNetwork), 'MockThresholdNetwork');

    // 8. Threshold Network Signer
    deployCodeTo('../node_modules/@cofhe/foundry-plugin/contracts/MockThresholdNetworkSigner.sol:MockThresholdNetworkSigner', DECRYPT_RESULT_SIGNER_ADDRESS);
    mockThresholdNetworkSigner = MockThresholdNetworkSigner(DECRYPT_RESULT_SIGNER_ADDRESS);
    vm.label(address(mockThresholdNetworkSigner), 'MockThresholdNetworkSigner');
  }


 function setUp() public {deployDay18Mocks();alice=createCofheClient();alice.connect(101);bob=createCofheClient();bob.connect(102);room=new EncryptedConfidant();budget(alice,1000);budget(bob,800);id=room.open(uint64(block.timestamp+1 hours));}
 function budget(CofheClient user,uint64 n) internal {(externalEuint64 h,bytes memory proof)=user.createExternalEuint64(n,address(room));vm.prank(user.account());room.initializeBudget(h,proof);}
 function bid(CofheClient user,uint64 n) internal {(externalEuint64 h,bytes memory proof)=user.createExternalEuint64(n,address(room));vm.prank(user.account());room.bid(id,h,proof);}
 function finish() internal {vm.warp(block.timestamp+1 hours);room.close(id);}
 function testEncryptedBudgetBidCloseAndOwnerACL() public {bid(alice,600);bid(bob,700);expectPlaintext(room.budgets(alice.account()),uint64(400));expectPlaintext(room.reservations(id,bob.account()),uint64(700));(,,,euint64 high,eaddress winner,)=room.lots(id);expectPlaintext(high,uint64(700));expectPlaintext(winner,bob.account());assertFalse(mockAcl.isAllowed(uint256(euint64.unwrap(high)),address(this)));assertFalse(mockAcl.isAllowed(uint256(euint64.unwrap(high)),alice.account()));assertTrue(mockAcl.isAllowed(uint256(euint64.unwrap(room.budgets(alice.account()))),alice.account()));assertFalse(mockAcl.isAllowed(uint256(euint64.unwrap(room.budgets(alice.account()))),bob.account()));finish();assertTrue(mockAcl.isAllowed(uint256(euint64.unwrap(high)),address(this)));assertFalse(mockAcl.isAllowed(uint256(euint64.unwrap(high)),bob.account()));vm.prank(alice.account());room.settle(id);vm.prank(bob.account());room.settle(id);expectPlaintext(room.budgets(alice.account()),uint64(1000));expectPlaintext(room.budgets(bob.account()),uint64(100));}
 function testInsufficientBudgetBecomesZeroWithoutRevert() public {bid(bob,801);expectPlaintext(room.budgets(bob.account()),uint64(800));expectPlaintext(room.reservations(id,bob.account()),uint64(0));(,,,euint64 high,eaddress winner,uint32 count)=room.lots(id);expectPlaintext(high,uint64(0));expectPlaintext(winner,address(0));assertEq(count,1);}
 function testTieFirstBidWinsAndNoRepeatedSettlement() public {bid(alice,500);bid(bob,500);finish();(,,,,eaddress winner,)=room.lots(id);expectPlaintext(winner,alice.account());vm.prank(bob.account());room.settle(id);expectPlaintext(room.budgets(bob.account()),uint64(800));vm.prank(bob.account());vm.expectRevert('not settleable');room.settle(id);}
 function testDeadlineDuplicatePauseAndRecovery() public {vm.expectRevert('not closable');room.close(id);bid(alice,400);(externalEuint64 h,bytes memory proof)=alice.createExternalEuint64(100,address(room));vm.prank(alice.account());vm.expectRevert('initialize or duplicate bid');room.bid(id,h,proof);room.pause(true);vm.prank(bob.account());vm.expectRevert('not open');room.bid(id,h,proof);finish();vm.prank(alice.account());room.settle(id);expectPlaintext(room.budgets(alice.account()),uint64(600));}
 function testInputBoundToWalletAndContract() public {(externalEuint64 h,bytes memory proof)=alice.createExternalEuint64(10,address(room));vm.prank(bob.account());vm.expectRevert();room.bid(id,h,proof);EncryptedConfidant other=new EncryptedConfidant();vm.prank(alice.account());vm.expectRevert();other.initializeBudget(h,proof);}
 function testUnauthorizedBudgetAndWinnerDecryptionRejected() public {bid(alice,400);autoDecryptOwn();ACP memory bobPermission=bob.ACP_createSelf();bytes32 budgetHandle=euint64.unwrap(room.budgets(alice.account()));vm.expectRevert();bob.decryptForView(budgetHandle,bobPermission);(,,,euint64 high,,)=room.lots(id);ACP memory alicePermission=alice.ACP_createSelf();bytes32 highHandle=euint64.unwrap(high);vm.expectRevert();alice.decryptForView(highHandle,alicePermission);}
 function autoDecryptOwn() internal {assertEq(alice.decryptForView(euint64.unwrap(room.budgets(alice.account())),alice.ACP_createSelf()),600);}
 function testNoBudgetResetAndGuardianOnly() public {(externalEuint64 h,bytes memory proof)=alice.createExternalEuint64(999,address(room));vm.prank(alice.account());vm.expectRevert('paused or initialized');room.initializeBudget(h,proof);vm.prank(alice.account());vm.expectRevert('guardian only');room.pause(true);}
 function testFuzzCreditConservation(uint64 a,uint64 b) public {a=uint64(bound(a,1,1000));b=uint64(bound(b,1,800));bid(alice,a);bid(bob,b);finish();vm.prank(alice.account());room.settle(id);vm.prank(bob.account());room.settle(id);uint256 sum=getPlaintext(room.budgets(alice.account()))+getPlaintext(room.budgets(bob.account()));assertEq(sum,1800-(a>=b?a:b));}
 function testMultipleLotsShareOneEncryptedBudget() public {bid(alice,600);bid(bob,700);uint256 first=id;id=room.open(uint64(block.timestamp+1 hours));bid(alice,600);expectPlaintext(room.reservations(id,alice.account()),uint64(0));expectPlaintext(room.budgets(alice.account()),uint64(400));vm.warp(block.timestamp+1 hours);room.close(first);room.close(id);vm.prank(alice.account());room.settle(first);vm.prank(alice.account());room.settle(id);expectPlaintext(room.budgets(alice.account()),uint64(1000));}
 function testUint64BoundaryAndLosingRefund() public {CofheClient charlie=createCofheClient();charlie.connect(103);CofheClient dana=createCofheClient();dana.connect(104);budget(charlie,type(uint64).max);budget(dana,type(uint64).max);bid(charlie,type(uint64).max);bid(dana,type(uint64).max);finish();vm.prank(charlie.account());room.settle(id);vm.prank(dana.account());room.settle(id);expectPlaintext(room.budgets(charlie.account()),uint64(0));expectPlaintext(room.budgets(dana.account()),type(uint64).max);}
}
