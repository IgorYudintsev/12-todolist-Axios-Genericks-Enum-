import Checkbox from '@mui/material/Checkbox'
import React, {ChangeEvent, useEffect, useState} from 'react'
import {AddItemForm} from '../common/components/AddItemForm/AddItemForm'
import {EditableSpan} from '../common/components/EditableSpan/EditableSpan'
import axios from "axios";


type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}

type PostType = {
    resultCode: number
    messages: string[],
    fieldsErrors: string[],
    data: {
        item: TodolistType
    }
}
type DeleteType = {
    data: Object
    fieldsErrors: Array<any>
    messages: Array<any>
    resultCode: number
}

//TODO: 2 типа очень похожи, поэтому используем дженерики
///T={} по умолчанию пусто

type ResponseType<T = {}> = {
    resultCode: number
    messages: string[],
    fieldsErrors: string[],
    data: T
}

type TasksType = {
    error: string | null
    items: Task[]
    totalCount: number
}


type TaskForUseState = {
    [key: string]: Task[]
}

type Task = {
    addedDate: string,
    deadline: string,
    description: string,
    id: string,
    order: number,
    priority: number,
    startDate: string,
    status: number,
    title: string,
    todoListId: string
};

//TODO: enum
//автоматически создает значения: 0,1,2
enum Status {
    fault = 0,
    partCompleted = 1,
    fullCompleted = 2,
    example = 'example' //можно словом
}

//console.log(Status.fullCompleted)
//TODO: и протипизировали
const a: Status = Status.fullCompleted


export const AppHttpRequests = () => {
    const [todolists, setTodolists] = useState<TodolistType[]>([])
    const [tasks, setTasks] = useState<TaskForUseState>({})
//Todo: Record<string, Task[]>:
// Record — это встроенный тип TypeScript, который позволяет создавать объекты с определенными ключами и значениями.
// string — это тип ключей в объекте. В данном случае, ключи будут строками.
// Task[] — это тип значений в объекте. В данном случае, значения будут массивами объектов типа Task.


    const getTodolistHandler = () => {
        axios.get<TodolistType[]>('https://social-network.samuraijs.com/api/1.1/todo-lists',
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4'
                }
            }
        ).then(res => {
            setTodolists(res.data)
            res.data.forEach(el => {
                return (
                    getTaskHandler(el.id)
                )
            })
        })
    }
    const getTaskHandler = (todolistId: string) => {
        axios.get<TasksType>(`https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks`,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4'
                }
            }
        ).then(res => {
            setTasks((prevState) => ({...prevState, [todolistId]: res.data.items}))
        })
    }

    useEffect(() => {
        getTodolistHandler()
    }, [])
    const createTodolistHandler = (title: string) => {
        axios.post<ResponseType<{ item: TodolistType }>>(
            'https://social-network.samuraijs.com/api/1.1/todo-lists',
            {title},
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then(res => {
                const newTodolist = res.data.data.item
                setTodolists((prevState) => ([newTodolist, ...prevState]))
            })
    }

    //TODO добавит квери параметры в запрос
    const addParams = {
        age: 100200,
        skill: 100200
    }
    const removeTodolistHandler = (id: string) => {
        axios.delete<ResponseType>(`https://social-network.samuraijs.com/api/1.1/todo-lists/${id}`,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
                params: addParams
            },
        ).then(() => {
            setTodolists(todolists.filter(el => el.id !== id))
        })

    }
    const updateTodolistHandler = (id: string, title: string) => {
        axios.put<ResponseType>(
            `https://social-network.samuraijs.com/api/1.1/todo-lists/${id}`,
            {title},
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then(() => {
                setTodolists(todolists.map(el => el.id === id ? {...el, title} : el))

            })
    }
    const createTaskHandler = (title: string, todolistId: string) => {
        axios.post<ResponseType<{ item: Task }>>(
            `https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks`,
            {title},
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then(res => {
                const newTask: Task = res.data.data.item
                //TODO: так лучше на случай undefined если внутри будет пусто-т.е. нет тасок
                //setTasks({...tasks,[todolistId]: [newTask,...tasks[todolistId]]}) -так может крашиться
                setTasks((prevState) => ({...prevState, [todolistId]: [...(prevState[todolistId] || []), newTask]}))
            })
    }
    const removeTaskHandler = (taskId: string, todolistId: string) => {
        axios.delete<ResponseType>(`https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks/${taskId}`,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            },
        ).then(() => {
            setTasks({
                ...tasks,
                [todolistId]: tasks[todolistId].filter(el => el.id !== taskId)
            })
        })
    }
    const changeTaskStatusHandler = (e: ChangeEvent<HTMLInputElement>, task: Task) => {
        const todolistId = task.todoListId
        const taskId = task.id
        const status: Status = e.currentTarget.checked ? Status.fullCompleted : Status.fault
        const updatedTask: Task = {...task, status}
        axios.put<ResponseType<{ item: Task }>>(
            `https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks/${taskId}`,
            updatedTask,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then((res) => {
                setTasks((prevState) => ({
                    ...prevState,
                    [todolistId]: prevState[todolistId].map(el => el.id === taskId ? updatedTask : el)
                }))
            })
    }
    const changeTaskTitleHandler = (title: string, task: Task) => {
        const todolistId = task.todoListId
        const taskId = task.id
        const model = {
            title: title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            startDate: task.startDate,
            deadline: task.deadline,
        }

        axios.put<ResponseType<{ item: Task }>>(
            `https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks/${taskId}`,
            model,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then((res) => {
                const newTask = res.data.data.item
                setTasks((prevState) => ({
                    ...prevState,
                    [todolistId]: prevState[todolistId].map(el => el.id === taskId ? newTask : el)
                }))
            })
    }
    const updateItem = (payload: { value: string | boolean, task: Task, key: string }) => {
        const {value, task, key} = payload
        const todolistId = task.todoListId
        const taskId = task.id
        //const status: т.к. статус из булеана boolean превратиться в number (0,2), то мы проверяем если булеан(может прийти и стринга)-то делаем цифрой
        const status: Status | string = typeof value === 'boolean' ? (value ? Status.fullCompleted : Status.fault) : value
        const updatedTask: Task = {...task, [key]: status}

        axios.put<ResponseType<{ item: Task }>>(
            `https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks/${taskId}`,
            updatedTask,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then((res) => {
                const newTask = res.data.data.item
                setTasks((prevState) => ({
                    ...prevState,
                    [todolistId]: prevState[todolistId].map(el => el.id === taskId ? newTask : el)
                }))
            })

    }

    const updateItemREST = (value: { title: string } | { status: 0|2 }, task: Task) => {
        console.log(value)
        // const {value, task, key} = payload
        const todolistId = task.todoListId
        const taskId = task.id
        const updatedTask: Task = {...task, ...value}


        // const model = {
        //     title: task.title,
        //     description: task.description,
        //     status: value,
        //     priority: task.priority,
        //     startDate: task.startDate,
        //     deadline: task.deadline,
        // }

             axios.put<ResponseType<{ item: Task }>>(
            `https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks/${taskId}`,
            updatedTask,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then((res) => {
                const newTask = res.data.data.item
                setTasks((prevState) => ({
                    ...prevState,
                    [todolistId]: prevState[todolistId].map(el => el.id === taskId ? newTask : el)
                }))
            })

    }

    const changeTaskStatusHandlerTOP = (checked: boolean, task: Task) => {
        const todolistId = task.todoListId
        const taskId = task.id
        const status: Status = checked ? Status.fullCompleted : Status.fault
        const updatedTask: Task = {...task, status}
        axiosUpdateItem({todolistId: todolistId, taskId: taskId, updatedTask: updatedTask})
    }
    const changeTaskTitleHandlerTOP = (title: string, task: Task) => {
        const todolistId = task.todoListId
        const taskId = task.id
        const updatedTask: Task = {...task, title}
        axiosUpdateItem({todolistId: todolistId, taskId: taskId, updatedTask: updatedTask})
    }
    const axiosUpdateItem = (payload: { todolistId: string, taskId: string, updatedTask: Task }) => {
        const {todolistId, taskId, updatedTask} = payload
        axios.put<ResponseType<{ item: Task }>>(
            `https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}/tasks/${taskId}`,
            updatedTask,
            {
                headers: {
                    Authorization: 'Bearer dd0e9571-2304-4e39-b3b6-250bb5ec82e4',
                    'API-KEY': 'ae98b7f2-5f73-4c8a-875b-ccc39eee3197',
                },
            }
        )
            .then((res) => {
                const newTask = res.data.data.item
                setTasks((prevState) => ({
                    ...prevState,
                    [todolistId]: prevState[todolistId].map(el => el.id === taskId ? newTask : el)
                }))
            })
    }

    return (
        <div style={{margin: '20px'}}>
            <AddItemForm addItem={createTodolistHandler}/>

            {/* Todolists */}
            {todolists.map((tl) => {
                return (
                    <div key={tl.id} style={todolist}>
                        <div>
                            <EditableSpan
                                value={tl.title}
                                onChange={(title: string) => updateTodolistHandler(tl.id, title)}
                            />
                            <button onClick={() => removeTodolistHandler(tl.id)}>x</button>
                        </div>
                        <AddItemForm addItem={title => createTaskHandler(title, tl.id)}/>

                        {/* Tasks */}
                        {!!tasks[tl.id] &&
                            tasks[tl.id].map((task: Task) => {
                                return (
                                    <div key={task.id}>
                                        <Checkbox
                                            checked={task.status === 2}//TODO: т.к IsDone не существует
                                            //checked={!!task.status}//TODO: или перепрошить тип
                                            // checked={Boolean(task.status) }//TODO: или перепрошить тип
                                            //TODO: индивидуальная функция
                                            // onChange={e => {
                                            //     console.log(e.currentTarget.checked)
                                            //      changeTaskStatusHandler(e, task)
                                            // }}
                                            //TODO: УНИВЕРСАЛЬНАЯ функция
                                            // onChange={e => {
                                            //     updateItem({
                                            //         value: e.target.checked,
                                            //         task: task,
                                            //         key: 'status'
                                            //     })
                                            // }}
                                            //TODO: УНИВЕРСАЛЬНАЯ функция REST
                                            onChange={e => {
                                                updateItemREST({status:e.currentTarget.checked ? Status.fullCompleted: Status.fault},task)
                                            }}
                                            //      {value: (e.currentTarget.checked ? Status.fullCompleted : Status.fault)},
                                            //         task
                                            //     )
                                            // }}



                                            //TODO: УНИВЕРСАЛЬНАЯ функция ТОП ВАРИАНТ
                                            // onChange={e => {
                                            //     console.log(e.currentTarget.checked)
                                            //     changeTaskStatusHandlerTOP(e.currentTarget.checked, task)
                                            // }}
                                        />
                                        <EditableSpan
                                            value={task.title}
                                            //TODO: индивидуальная функция
                                            // onChange={title => changeTaskTitleHandler(title, task)}
                                            //TODO: УНИВЕРСАЛЬНАЯ функция REST
                                            onChange={title => {
                                                updateItemREST({title},task)
                                            }}
                                            //TODO: УНИВЕРСАЛЬНАЯ функция ТОП ВАРИАНТ
                                            //onChange={title => changeTaskTitleHandlerTOP(title, task)}
                                        />
                                        <button onClick={() => removeTaskHandler(task.id, tl.id)}>x</button>
                                    </div>
                                )
                            })}
                    </div>
                )
            })}
        </div>
    )
}

// Styles
const todolist: React.CSSProperties = {
    border: '1px solid black',
    margin: '20px 0',
    padding: '10px',
    width: '300px',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
}
