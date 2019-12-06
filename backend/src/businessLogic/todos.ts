import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodosAccess()
const bucketName = process.env.IMAGES_S3_BUCKET
export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
  ): Promise<TodoItem> {

  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString(),
    attachmentUrl: `https://${bucketName}.s3.us-east-2.amazonaws.com/${itemId}`
  })
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest,
  userId: string
  ): Promise<TodoUpdate> {
  const key = {
          "todoId": todoId,
          "userId": userId
        }
  return await todoAccess.updateTodo(key, updateTodoRequest)
}

export async function deleteTodo(
  todoId: string,
  userId: string
  ): Promise<TodoItem> {
  const key = {
          "todoId": todoId,
          "userId": userId
        }
  return await todoAccess.deleteTodo(key)
}