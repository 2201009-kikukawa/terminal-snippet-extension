export enum EventTypes {
  AddSnippet = "addSnippet",
  AddGroup = "addGroup",
  GetSnippets = "getSnippets",
  GetGroups = "getGroups",
  RunSnippet = "runSnippet",
  DeleteSnippet = "deleteSnippet",
  UpdateSnippet = "updateSnippet",
  // ▼▼▼【ここから追加】▼▼▼
  UpdateOrder = "updateOrder",
  // ▲▲▲【ここまで追加】▲▲▲
  SnippetsData = "snippetsData",
  GroupsData = "groupsData",
}

export type VSCodeEvent = {
  type: EventTypes;
  value?: any;
};
