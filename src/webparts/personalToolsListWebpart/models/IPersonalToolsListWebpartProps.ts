import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPropertyFieldSite } from "@pnp/spfx-property-controls";

export interface IPersonalToolsListWebpartProps {
  wpTitle: string;
  wpSites?: IPropertyFieldSite[];
  wpLists?: {id: string, title: string, url: string};
  isDarkTheme: boolean;
  context: WebPartContext;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userEmail: string;
  twoColumns: boolean;
}
