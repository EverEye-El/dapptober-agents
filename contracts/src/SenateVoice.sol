// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {ERC20Votes} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';
import {VotesExtended} from '@openzeppelin/contracts/governance/utils/VotesExtended.sol';
import {Votes} from '@openzeppelin/contracts/governance/utils/Votes.sol';
import {EIP712} from '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
/// @notice Fixed nontransferable membership; one voice per founding member. Members retain override rights.
contract SenateVoice is ERC20Votes, VotesExtended {
 constructor(address[] memory members) ERC20('Senate Voice','VOICE') EIP712('Senate Voice','1') {
  require(members.length>=3&&members.length<=32,'membership size');
  for(uint256 i;i<members.length;i++){require(members[i]!=address(0)&&balanceOf(members[i])==0,'invalid member');_mint(members[i],1e18);_delegate(members[i],members[i]);}
 }
 function clock() public view override returns(uint48){return uint48(block.timestamp);}
 function CLOCK_MODE() public pure override returns(string memory){return 'mode=timestamp';}
 function _update(address from,address to,uint256 amount) internal override(ERC20Votes){require(from==address(0),'nontransferable');super._update(from,to,amount);}
 function _delegate(address account,address delegatee) internal override(Votes,VotesExtended){super._delegate(account,delegatee);}
 function _transferVotingUnits(address from,address to,uint256 amount) internal override(Votes,VotesExtended){super._transferVotingUnits(from,to,amount);}
}
