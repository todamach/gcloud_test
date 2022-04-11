import { Controller, Get, Headers } from '@nestjs/common';
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
    const url = 'https://webhook.site/bf43e080-0985-45ce-9d8b-2028e29fde45';
    const inSeconds = 60;
    const serviceAccountEmail =
      'test-service-account@indigo-splice-346214.iam.gserviceaccount.com';

    // Construct the fully qualified queue name.
    const parent = this.client.queuePath(this.project, location, queue);

    const task: ITask = {
      httpRequest: {
        httpMethod: 'POST',
        url,
        // oidcToken: {
        //   serviceAccountEmail,
        // },
      },
    };

    const payload = JSON.stringify({ testParam: 'test' });

    if (payload && task.httpRequest) {
      task.httpRequest.body = Buffer.from(payload).toString('base64');
    }

    if (inSeconds) {
      // The time when the task is scheduled to be attempted.
      task.scheduleTime = {
        seconds: inSeconds + Date.now() / 1000,
      };
    }

    // Send create task request.
    console.log('Sending task:');
    console.log(task);
    const request: ICreateTaskRequest = { parent: parent, task: task };
    const [response] = await this.client.createTask(request);
    console.log(`Created task ${response.name}`);
    return response;
  }

  @Get('execute-queue-item')
  async executeQueueItem(@Headers('token') token: string): Promise<any> {
    const CLIENT_ID = '112332348383241365204';
    const client = new OAuth2Client(CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
      // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return payload;
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
