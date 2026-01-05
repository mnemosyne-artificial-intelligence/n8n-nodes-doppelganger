import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Doppelganger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'doppelganger',
    name: 'doppelganger',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Run a Doppelganger task via the API',
    defaults: {
      name: 'doppelganger',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'doppelgangerApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Task ID',
        name: 'taskId',
        type: 'string',
        default: '',
        required: true,
        description: 'Task ID from the Doppelganger dashboard',
      },
      {
        displayName: 'Variables (JSON)',
        name: 'variables',
        type: 'json',
        default: '{}',
        required: false,
        description: 'JSON object to override task variables',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const taskId = this.getNodeParameter('taskId', i) as string;
      const variablesRaw = this.getNodeParameter('variables', i) as unknown;

      let variables: IDataObject = {};
      if (variablesRaw) {
        if (typeof variablesRaw === 'string') {
          try {
            variables = JSON.parse(variablesRaw) as IDataObject;
          } catch (error) {
            throw new NodeOperationError(this.getNode(), 'Variables must be valid JSON.', {
              itemIndex: i,
            });
          }
        } else {
          variables = variablesRaw as IDataObject;
        }
      }

      const credentials = await this.getCredentials('doppelgangerApi');
      const baseUrl = String(credentials.baseUrl || '').replace(/\/+$/, '');

      if (!baseUrl) {
        throw new NodeOperationError(this.getNode(), 'Base URL is required in credentials.', {
          itemIndex: i,
        });
      }

      const options = {
        method: 'POST' as IHttpRequestMethods,
        url: `${baseUrl}/tasks/${encodeURIComponent(taskId)}/api`,
        body: {
          variables,
        },
        json: true,
      };

      const response = await this.helpers.requestWithAuthentication.call(
        this,
        'doppelgangerApi',
        options,
      );

      returnData.push({ json: response as IDataObject });
    }

    return [returnData];
  }
}
