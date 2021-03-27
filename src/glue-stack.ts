import * as glue from '@aws-cdk/aws-glue';
import * as core from '@aws-cdk/core';

export interface GlueStackProps extends core.StackProps {
  readonly Glue: Glue[];
}

interface Glue {
  readonly Jobs?: Job[];
  readonly Databases?: Database[];
};

interface Job {
  JobName: string;
  IAMRole: string;
  Type: string;
  GlueVersion: string;
  PythonVersion: string;
  Language: string;
  ScriptLocation: string;
  JobBookMark: string;
  MaxCapacity: number;
  JobTimeout: number;
  NoWorkers: number;
  PythonLibPath: string;
  JobParameters: [];
  TempDirectory: string;
  MaxConcurrency: 4;
  readonly Tags?: Tag[];
}

interface Database {
  readonly DatabaseName: string;
}

interface Tag {
  Key: string;
  Value: string;
}

export class GlueStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: GlueStackProps) {
    super(scope, id, props);

    for (const g of props.Glue) {
      if (g.Jobs) {
        for (const job of g.Jobs) {
          const gl = new glue.CfnJob(this, job.JobName, {
            name: job.JobName,
            role: job.IAMRole,
            workerType: job.Type ? job.Type : undefined,
            glueVersion: job.GlueVersion ? job.GlueVersion : undefined,
            maxCapacity: job.MaxCapacity,
            timeout: job.JobTimeout,
            numberOfWorkers: job.NoWorkers,
            command: {
              pythonVersion: job.PythonVersion ? job.PythonVersion : undefined,
              scriptLocation: job.ScriptLocation,
              name: job.JobName,
            },
            executionProperty: {
              maxConcurrentRuns: job.MaxConcurrency,
            },
            defaultArguments: {
              'job-bookmark-option': job.JobBookMark === 'True' ? 'job-bookmark-enable' : 'job-bookmark-enable',
              'job-language': job.Language,
              'TempDir': job.TempDirectory,
              'scriptLocation': job.PythonLibPath,
              ...job.JobParameters,
            },
          });

          if (job.Tags) {
            for (const tag of job.Tags) {
              core.Tags.of(gl).add(tag.Key, tag.Value);
            }
          }
        }
      }

      if (g.Databases) {
        for (const database of g.Databases) {
          new glue.Database(this, database.DatabaseName, {
            databaseName: database.DatabaseName,
          });
        }
      }
    }
  }
}