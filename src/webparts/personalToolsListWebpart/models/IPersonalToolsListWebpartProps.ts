import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IPersonalToolsListWebpartProps {
  wpTitle: string;
  isDarkTheme: boolean;
  context: WebPartContext;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userEmail: string;
  twoColumns: boolean;
}
