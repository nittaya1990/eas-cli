import { Actor } from '../user/User';

interface MockProject {
  projectRoot: string;
  projectTree: Record<string, string>;
  appJSON: AppJSON;
  packageJSON: PackageJSON;
}

interface PackageJSON {
  name: string;
  version: string;
  description: string;
  main: string;
}

interface AppJSON {
  expo: {
    name: string;
    version: string;
    slug: string;
    sdkVersion: string;
    owner?: string;
    [key: string]: any;
  };
}

export function createTestProject(
  user: Actor,
  appJSONExtraData?: Record<string, object | string>
): MockProject {
  const projectRoot = '/test-project';
  const packageJSON: PackageJSON = {
    name: 'testing123',
    version: '0.1.0',
    description: 'fake description',
    main: 'index.js',
  };

  const owner = appJSONExtraData?.owner as string | undefined;
  const appJSON: AppJSON = {
    expo: {
      name: 'testing 123',
      version: '0.1.0',
      slug: 'testing-123',
      sdkVersion: '33.0.0',
      owner: owner ?? (user.__typename === 'User' ? user.username : undefined),
      ...appJSONExtraData,
    },
  };
  return {
    appJSON,
    packageJSON,
    projectRoot,
    projectTree: {
      [projectRoot + '/package.json']: JSON.stringify(packageJSON, null, 2),
      [projectRoot + '/app.json']: JSON.stringify(appJSON, null, 2),
    },
  };
}
