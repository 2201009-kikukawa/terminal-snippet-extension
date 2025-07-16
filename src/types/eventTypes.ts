export enum EventTypes {
  AddSnippet = "addSnippet",
  AddGroup = "addGroup", // ★ 追加
  GetSnippets = "getSnippets",
  GetGroups = "getGroups", // ★ 追加
  RunSnippet = "runSnippet",
  DeleteSnippet = "deleteSnippet",
  SnippetsData = "snippetsData",
  GroupsData = "groupsData", // ★ 追加
}

export type VSCodeEvent = {
  type: EventTypes;
  value?: any;
};
