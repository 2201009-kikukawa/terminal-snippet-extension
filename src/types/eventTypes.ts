export enum EventTypes {
  AddSnippet = "addSnippet",
  AddGroup = "addGroup",
  GetSnippets = "getSnippets",
  GetGroups = "getGroups",
  RunSnippet = "runSnippet",
  DeleteSnippet = "deleteSnippet",
  SnippetsData = "snippetsData",
  GroupsData = "groupsData",
}

export type VSCodeEvent = {
  type: EventTypes;
  value?: any;
};
