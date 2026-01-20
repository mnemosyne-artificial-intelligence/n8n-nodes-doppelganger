import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Doppelganger implements INodeType {
  methods = {
    loadOptions: {
      async getTasks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('doppelgangerApi');
        const baseUrl = String(credentials.baseUrl || '').replace(/\/+$/, '');

        if (!baseUrl) {
          return [];
        }

        const options = {
          method: 'GET' as IHttpRequestMethods,
          url: `${baseUrl}/api/tasks/list`,
          json: true,
        };

        const response = await this.helpers.requestWithAuthentication.call(
          this,
          'doppelgangerApi',
          options,
        );

        const tasks = (response as IDataObject)?.tasks as IDataObject[] | undefined;
        if (!Array.isArray(tasks)) {
          return [];
        }

        return tasks
          .map((task) => ({
            name: String(task?.name || task?.id || ''),
            value: String(task?.id || ''),
          }))
          .filter((option) => option.value);
      },
    },
  };

  description: INodeTypeDescription = {
    displayName: 'Doppelganger',
    name: 'doppelganger',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Run a Doppelganger task via the API',
    defaults: {
      name: 'Execute Task',
    },
    inputs: ['main'],
    outputs: ['main'],
    usableAsTool: true,
    credentials: [
      {
        name: 'doppelgangerApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Execute Task',
            value: 'executeTask',
            description: 'Run a Doppelganger task',
            action: 'Execute a task',
          },
        ],
        default: 'executeTask',
      },
      {
        displayName: 'Task ID',
        name: 'taskId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getTasks',
        },
        default: '',
        required: true,
        description: 'Task ID from the Doppelganger dashboard',
      },
      {
        displayName: 'Variables',
        name: 'variables',
        type: 'fixedCollection',
        default: {},
        required: false,
        description: 'Optional task variables to override',
        typeOptions: {
          multipleValues: true,
        },
        options: [
          {
            name: 'values',
            displayName: 'Variable',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                required: true,
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as string;
      if (operation !== 'executeTask') {
        throw new NodeOperationError(this.getNode(), 'Unsupported operation.', {
          itemIndex: i,
        });
      }

      const taskId = this.getNodeParameter('taskId', i) as string;
      const variablesRaw = this.getNodeParameter('variables', i) as {
        values?: Array<{ name?: string; value?: string }>;
      };

      const variables: IDataObject = {};
      if (variablesRaw?.values?.length) {
        for (const entry of variablesRaw.values) {
          const key = (entry.name || '').trim();
          if (!key) {
            continue;
          }
          variables[key] = entry.value ?? '';
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
