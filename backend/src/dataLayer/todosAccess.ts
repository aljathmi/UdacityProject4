import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME) {
  }

  async getAllTodos(userId): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient
    .query({
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todoKey, updatedTodo: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: todoKey,
      UpdateExpression: "set #name=:n, #dueDate=:t, #done=:d",
      ExpressionAttributeValues:{
          ":n":updatedTodo.name,
          ":t":updatedTodo.dueDate,
          ":d":updatedTodo.done
      },
      ExpressionAttributeNames:{
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
    }).promise()

    return updatedTodo
  }

  async deleteTodo(todoKey): Promise<TodoItem> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: todoKey
    }).promise()

    return todoKey
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
