const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });

// for querying people dbs
// output is 2d array: res[0] names, res[1] id, index for pairing
const getPeople = async (database_id, filter = undefined) => {
  let names = [];
  let ids = [];

  hasMore = true;
  start_cursor = undefined;
  while (hasMore) {
    const people = await notion.databases.query({
      database_id,
      start_cursor,
      filter,
    });

    hasMore = people.has_more;
    start_cursor = people.next_cursor;

    const n = people.results.map((r) => r.properties.Name.title[0].plain_text);
    names = names.concat(n);

    const i = people.results.map((r) => r.id);
    ids = ids.concat(i);
  }
  return [names, ids];
};

// mark error flag checkbox in everyone db
const flagInEveryone = async (pageId) =>
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Flagged: {
        checkbox: true,
      },
    },
  });

// add to everyone db
const addToEveryone = async (person, relations) => {
  await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.EVERYONE_DB,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: person,
            },
          },
        ],
      },
      Relation: {
        multi_select: relations.map((rel) => {
          return {
            name: rel,
          };
        }),
      },
    },
  });
};

module.exports = { getPeople, flagInEveryone, addToEveryone };
