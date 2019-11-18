const { ApiPromise, WsProvider } = require('@polkadot/api');

const PrivateWsEndpoint = 'ws://176.58.102.23:9944';

const isMember = async (api, who) => {
  const members = await api.query.electionsPhragmen.members();
  if (members.length > 0) {
    for (let i = 0; i < members.length; i++) {
      if (members[i][0].toString() === who) {
        // console.log('member', members[i][0].toString());
        return true;
      }
    }
  }
  return false;
}

const isCandidate = async (api, who) => {
  const candidates = await api.query.electionsPhragmen.candidates();
  if (candidates.length > 0) {
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].toString() === who) {
        // console.log('candidate', candidates[i].toString());
        return true;
      }
    }
  }
  return false;
}

// const isMember = async (api, who) => {
//   const memberSet = await getMembers(api);
//   return memberSet.has(who);
// }

// const isCandidate = async (api, who) => {
//   const candidateSet = await getCandidates(api);
//   return candidateSet.has(who);
// }

const isDefunctVoter = async (api, who) => {
  const isVoter = await api.query.electionsPhragmen.stakeOf(who);
  // console.log(Number(isVoter));
  if (Number(isVoter) > 0) {
    const votesOf = await api.query.electionsPhragmen.votesOf(who);
    // console.log(votesOf[0].toString());
    for (let i = 0; i < votesOf[0].length; i++) {
      // console.log('testing', votesOf[0][i].toString());
      if (await isMember(api, votesOf[0][i].toString()) || await isCandidate(api, votesOf[0][i].toString())) {
        return false;
      }
    }
    console.log('found defunct', who);
    return true;
  } else {
    return false;
  }
}

const lookupIndex = async (api, index, enumSetSize = 64) => {
  const set = await api.query.indices.enumSet(Math.floor(index / enumSetSize));
  const i = index % enumSetSize;
  return set[i].toString();
}

const getAllAccounts = async (api) => {
  let set = new Set();
  try {
    let counter = 0;
    let account = await lookupIndex(api, counter);
    while (account) {
      console.log(counter, account);
      set.add(account);
      counter++;
      account = await lookupIndex(api, counter);
    }
  } catch (err) {
    // done
  } finally {
    return set;
  }
}

const tests = async (api) => {
  // console.log('Running isCandidates');
  // console.log(await isCandidate(api, ''));
  // console.log('Running isMember');
  // console.log(await isMember(api, ''));
  // const testMember = 'CanLB42xJughpTRC1vXStUryjWYkE679emign1af47QnAQC';
  // const defunct = 'HnKoshkPTzLwTdKhnTJYL6QgnDaSW4ojiSZdQzj7dzufJ7t';
  // console.log('should be true...');
  // console.log(await isMember(api, testMember));
  // console.log('Testing isDefunctVotes');
  // console.log(await isDefunctVoter(api, ''));
  // console.log(await isDefunctVoter(api, testMember));
  // console.log(await isDefunctVoter(api, defunct));
  const set = await getAllAccounts(api);
  // console.log('got set:', set);
  set.forEach(async (account) => {
    await isDefunctVoter(api, account);
  });
}

const main = async () => {
  const provider = new WsProvider(PrivateWsEndpoint);
  const api = await ApiPromise.create({ provider });

  if (process.argv[2] === 'TEST') {
    await tests(api);
  } else {
    console.log('Now performing the scrape...');
    const set = await getAllAccounts(api);
    set.forEach(async (account) => {
      await isDefunctVoter(api, account);
    });
  }
}

try { main(); } catch (error) { console.error(error); }
