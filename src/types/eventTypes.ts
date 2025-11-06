export enum EventTypes {
  AddSnippet = "addSnippet",
  AddGroup = "addGroup",
  GetSnippets = "getSnippets",
  GetGroups = "getGroups",
  RunSnippet = "runSnippet",
  DeleteSnippet = "deleteSnippet",
  UpdateSnippet = "updateSnippet",
  UpdateOrder = "updateOrder",
  // ▼▼▼【ここから追加】▼▼▼
  UpdateGroup = "updateGroup",
  DeleteGroup = "deleteGroup",
  // ▲▲▲【ここまで追加】▲▲▲
  SnippetsData = "snippetsData",
  GroupsData = "groupsData",
}

export type VSCodeEvent = {
  type: EventTypes;
  value?: any;
};
