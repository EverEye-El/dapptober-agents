// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Governor} from '@openzeppelin/contracts/governance/Governor.sol';
import {GovernorVotes} from '@openzeppelin/contracts/governance/extensions/GovernorVotes.sol';
import {GovernorCountingOverridable} from '@openzeppelin/contracts/governance/extensions/GovernorCountingOverridable.sol';
import {GovernorVotesQuorumFraction} from '@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol';
import {IVotes} from '@openzeppelin/contracts/governance/utils/IVotes.sol';
import {VotesExtended} from '@openzeppelin/contracts/governance/utils/VotesExtended.sol';
/// @notice Policy-resolution governor: agent ballots are provisional; the final window belongs to humans.
contract SwarmGovernor is GovernorCountingOverridable,GovernorVotesQuorumFraction {
 uint256 public immutable delaySeconds;uint256 public immutable periodSeconds;uint256 public immutable overrideSeconds;
 bytes32 public adoptedResolution;
 constructor(IVotes voice,uint256 delay_,uint256 period_,uint256 override_) Governor('Swarm Senate') GovernorVotes(voice) GovernorVotesQuorumFraction(51){
  require(delay_>=1&&period_>=120&&override_>=60&&override_<period_,'invalid windows');delaySeconds=delay_;periodSeconds=period_;overrideSeconds=override_;
 }
 function votingDelay() public view override returns(uint256){return delaySeconds;}
 function votingPeriod() public view override returns(uint256){return periodSeconds;}
 function proposalThreshold() public pure override returns(uint256){return 0;}
 function agentDeadline(uint256 id) public view returns(uint256){return proposalDeadline(id)-overrideSeconds;}
 function propose(address[] memory targets,uint256[] memory values,bytes[] memory calldatas,string memory description) public override returns(uint256){
  require(VotesExtended(address(token())).getPastBalanceOf(_msgSender(),clock()-1)>0,'members only');
  require(targets.length==1&&values.length==1&&calldatas.length==1&&targets[0]==address(this)&&values[0]==0&&calldatas[0].length==36&&bytes4(calldatas[0])==this.adopt.selector,'resolution only');return super.propose(targets,values,calldatas,description);
 }
 function adopt(bytes32 resolution) external onlyGovernance {adoptedResolution=resolution;}
 function _castVote(uint256 id,address account,uint8 support,string memory reason,bytes memory params) internal override returns(uint256){
  // An address with membership units is a human. Delegated agent addresses have no membership units.
  if(VotesExtended(address(token())).getPastBalanceOf(account,proposalSnapshot(id))==0)require(clock()<=agentDeadline(id),'human review window');
  return super._castVote(id,account,support,reason,params);
 }
 function _quorumReached(uint256 id) internal view override(Governor,GovernorCountingOverridable) returns(bool){return super._quorumReached(id);}
}
