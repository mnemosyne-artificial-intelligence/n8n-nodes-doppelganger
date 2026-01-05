import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DoppelgangerApi implements ICredentialType {
  name = 'doppelgangerApi';
  displayName = 'Doppelganger API';
  documentationUrl = 'https://doppelgangerdev.com/docs/api-authentication-and-secure-access';
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://localhost:11345',
      required: true,
      description: 'Doppelganger server base URL',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'API key from Doppelganger Settings',
    },
  ];

  authenticate = {
    type: 'generic',
    properties: {
      headers: {
        'x-api-key': '={{$credentials.apiKey}}',
      },
    },
  } as const;
}
