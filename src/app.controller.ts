import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { AppService } from './app.service';
import { CloudTasksClient } from '@google-cloud/tasks';
import { google } from '@google-cloud/tasks/build/protos/protos';
import ITask = google.cloud.tasks.v2.ITask;
import ICreateTaskRequest = google.cloud.tasks.v2.ICreateTaskRequest;
import { OAuth2Client } from 'google-auth-library';

@Controller()
export class AppController {
  private client: CloudTasksClient;
  private project = 'indigo-splice-346214';
  private authKeyFilePath = './indigo-splice-346214-cb376277fc11.json';

  constructor(private readonly appService: AppService) {
    this.client = new CloudTasksClient({ project: this.project });
  }

  @Get('create-queue-item')
  async createQueueItem(): Promise<any> {
    const queue = 'Test-queue';
    const location = 'europe-central2';
    const url =
      'https://gcloud-test-otw6ltswaq-lm.a.run.app/execute-queue-item';
    const inSeconds = 60;
    const serviceAccountEmail =
      'test-service-account@indigo-splice-346214.iam.gserviceaccount.com';

    // Construct the fully qualified queue name.
    const parent = this.client.queuePath(this.project, location, queue);

    const task: ITask = {
      httpRequest: {
        httpMethod: 'POST',
        url,
        oidcToken: {
          serviceAccountEmail,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      },
    };

    const payload = JSON.stringify({ testParam: 'test' });

    if (payload && task.httpRequest) {
      task.httpRequest.body = payload; //Buffer.from(payload).toString('base64');
    }

    // if (inSeconds) {
    //   // The time when the task is scheduled to be attempted.
    //   task.scheduleTime = {
    //     seconds: inSeconds + Date.now() / 1000,
    //   };
    // }

    // Send create task request.
    console.log('Sending task:');
    console.log(task);
    const request: ICreateTaskRequest = { parent: parent, task: task };
    const [response] = await this.client.createTask(request);
    console.log(`Created task ${response.name}`);
    return response;
  }

  @Post('execute-queue-item')
  async executeQueueItem(@Headers() headers: string, @Body() request): Promise<any> {
    console.log('request body', request);
    console.log('request headers', headers);

    const CLIENT_ID = '112332348383241365204';
    const client = new OAuth2Client(CLIENT_ID);
    // console.log('token', headers.token);
    // console.log('token', headers.token.split(' ')[1]);
    // const ticket = await client.verifyIdToken({
    //   idToken: token.split(' ')[1],
    //   audience: 'https://gcloud-test-otw6ltswaq-lm.a.run.app/execute-queue-item',
    //   // Specify the CLIENT_ID of the app that accesses the backend
    //   // Or, if multiple clients access the backend:
    //   //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    // });
    //
    // const payload = ticket.getPayload();
    // console.log(payload);
    return headers;
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
