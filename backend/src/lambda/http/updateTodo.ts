import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

// import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS  from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  // const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const parsedBody = JSON.parse(event.body)
 
  const updatedTodo = {
    todoId: todoId,
    ...parsedBody
  }

  await docClient.update({
    TableName: todosTable,
    Key: {
      "todoId": todoId
    },
    UpdateExpression: "set name =:n, dueDate=:t, done=:d",
    ExpressionAttributeValues:{
        ":n":updatedTodo.name,
        ":t":updatedTodo.dueDate,
        ":d":updatedTodo.done
    },
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      updatedTodo
    })
  }
}
