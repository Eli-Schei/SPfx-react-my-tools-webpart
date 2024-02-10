import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'PersonalToolsListWebpartWebPartStrings';
import PersonalToolsListWebpart from './components/PersonalToolsListWebpart';
import { IPersonalToolsListWebpartProps } from './models/IPersonalToolsListWebpartProps';
import { IPropertyFieldSite, PropertyFieldSitePicker } from '@pnp/spfx-property-controls/lib/PropertyFieldSitePicker';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import PnPTelemetry from "@pnp/telemetry-js";

export interface IPersonalToolsListWebpartWebPartProps {
  wpTitle: string;
  wpSites: IPropertyFieldSite[];
  wpList: { id: string, title: string, url: string };
  twoColumns: boolean;
}

const telemetry = PnPTelemetry.getInstance();
telemetry.optOut();

export default class PersonalToolsListWebpartWebPart extends BaseClientSideWebPart<IPersonalToolsListWebpartWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IPersonalToolsListWebpartProps> = React.createElement(
      PersonalToolsListWebpart,
      {
        wpTitle: this.properties.wpTitle,
        wpSites: this.properties.wpSites,
        wpLists: this.properties.wpList,
        isDarkTheme: this._isDarkTheme,
        context: this.context,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userEmail: this.context.pageContext.user.email,
        twoColumns: this.properties.twoColumns
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }


  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Webpart settings"
          },
          groups: [
            {
              groupName: "Basic settings",
              groupFields: [
                PropertyPaneTextField('wpTitle', {
                  label: "Title",
                  description:
                    "If this is not set the title will be shown as 'My tools'",
                }),
                PropertyPaneCheckbox('twoColumns', {
                  checked: false,
                  disabled: false,
                  text: "Show links in two columns? (Defaults to 1column if this is not checked)"
                }),
              ]
            }, {
              groupName: "List settings",
              groupFields: [
                PropertyFieldSitePicker('wpSites', {
                  label: 'Select site that contains the tools list',
                  initialSites: this.properties.wpSites?.length > 0 ? this.properties.wpSites : [{ url: this.context.pageContext.web.serverRelativeUrl, title: this.context.pageContext.web.title }],
                  context: this.context as any,
                  deferredValidationTime: 500,
                  multiSelect: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  key: 'wpSites'
                }),
                PropertyFieldListPicker('wpLists', {
                  label: 'Select the tools list',
                  selectedList: this.properties.wpList,
                  includeHidden: false,
                  baseTemplate: 100,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  includeListTitleAndUrl: true,
                  disabled: (this.properties.wpSites && this.properties.wpSites.length > 0) ? false : true,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  multiSelect: false,
                  webAbsoluteUrl: (this.properties.wpSites && this.properties.wpSites.length > 0) ? this.properties.wpSites[0].url : this.context.pageContext.web.absoluteUrl,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
