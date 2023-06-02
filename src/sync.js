const req = require("./requests");

const syncPeopleDBs = async () => {
  const res = { added: [], flagged: [] };

  // filter for client or worker only
  const cwFilter = {
    or: [
      {
        property: "Relation",
        multi_select: {
          contains: "Worker",
        },
      },
      {
        property: "Relation",
        multi_select: {
          contains: "Client",
        },
      },
    ],
  };
  const everyone = await req.getPeople(process.env.EVERYONE_DB, cwFilter);

  const clients = await req.getPeople(process.env.CLIENT_DB);
  const workers = await req.getPeople(process.env.WORKER_DB);

  const people = {};

  const clientSet = new Set(clients[0]);
  clientSet.forEach((c) => {
    if (!people[c]) people[c] = [];
    people[c].push("Client");
  });

  const workerSet = new Set(workers[0]);
  workerSet.forEach((w) => {
    if (!people[w]) people[w] = [];
    people[w].push("Worker");
  });

  // sync up people db data

  // check for duplicates before adding to everyone db
  const everyoneSet = new Set(everyone[0]);
  for (let person in people)
    if (!everyoneSet.has(person)) {
      req.addToEveryone(person, people[person]);
      res.added.push(person);
    }

  // flag everyone db syncing errors
  for (let i = 0; i < everyone[0].length; i++) {
    const person = everyone[0][i];
    if (!clientSet.has(person) && !workerSet.has(person)) {
      req.flagInEveryone(everyone[1][i]);
      res.flagged.push(person);
    }
  }
  return res;
};

module.exports = syncPeopleDBs;
