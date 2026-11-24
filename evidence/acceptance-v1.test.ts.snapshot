import { describe, expect, it } from "vitest"
import {
    createTask,
    isBlankTitle,
    openCount,
    renameTask,
    seedTasks,
    Task,
    visibleTasks,
} from "./tasks"

const blanks = ["", " ", "\t", "\u00a0", " \t\u00a0 "]
const padded = ["  Купить хлеб  ", "\tКупить хлеб\t", "\u00a0Купить хлеб\u00a0", " \t\u00a0Купить хлеб\u00a0\t "]

describe("R1: создание и переименование", () => {
    it.each(blanks)("считает пустым название %j", (title) => {
        expect(isBlankTitle(title)).toBe(true)
        expect(createTask(10, title)).toBeUndefined()
    })

    it.each(padded)("обрезает края при создании: %j", (title) => {
        expect(createTask(10, title)).toEqual({ id: 10, title: "Купить хлеб", done: false })
    })

    it.each(blanks)("отклоняет пустое переименование %j и сохраняет прежнюю задачу", (title) => {
        const tasks: Task[] = [
            { id: 1, title: "Прежнее название", done: true },
            { id: 2, title: "Другая задача", done: false },
        ]
        const before = structuredClone(tasks)
        expect(renameTask(tasks, 1, title)).toEqual(before)
        expect(tasks).toEqual(before)
    })

    it.each(padded)("обрезает края при переименовании: %j", (title) => {
        const tasks: Task[] = [
            { id: 1, title: "Прежнее название", done: true },
            { id: 2, title: "Другая задача", done: false },
        ]
        const before = structuredClone(tasks)
        expect(renameTask(tasks, 1, title)).toEqual([
            { id: 1, title: "Купить хлеб", done: true },
            before[1],
        ])
        expect(tasks).toEqual(before)
    })

    it("сохраняет внутренние пробелы содержательного названия", () => {
        const title = "Купить  хлеб\tи\u00a0молоко"
        expect(createTask(1, ` ${title} `)?.title).toBe(title)
        expect(renameTask([{ id: 1, title: "Было", done: false }], 1, ` ${title} `)[0].title).toBe(title)
    })

    it("не изменяет задачи при неизвестном идентификаторе", () => {
        const tasks = structuredClone(seedTasks)
        const before = structuredClone(tasks)
        expect(renameTask(tasks, 999, "Новое название")).toEqual(before)
        expect(tasks).toEqual(before)
    })
})

describe("R2: унаследованные пустые строки", () => {
    const oldTasks: Task[] = [
        { id: 1, title: "Открытая", done: false },
        { id: 2, title: "Готовая", done: true },
        ...blanks.flatMap((title, i) => [
            { id: 10 + i * 2, title, done: false },
            { id: 11 + i * 2, title, done: true },
        ]),
    ]

    it.each([
        ["all", [1, 2]],
        ["open", [1]],
        ["done", [2]],
    ] as const)("скрывает старые пустые строки в фильтре %s", (filter, expected) => {
        const before = structuredClone(oldTasks)
        expect(visibleTasks(oldTasks, filter).map((task) => task.id)).toEqual(expected)
        expect(oldTasks).toEqual(before)
    })

    it("скрывает существующую строку 3 стартера без удаления из данных", () => {
        expect(visibleTasks(seedTasks, "all").map((task) => task.id)).toEqual([1, 2])
        expect(visibleTasks(seedTasks, "open").map((task) => task.id)).toEqual([1])
        expect(seedTasks.find((task) => task.id === 3)?.title).toBe("   ")
    })
})

describe("R3: счётчик открытых совпадает со списком", () => {
    it.each([
        { label: "пустая доска", tasks: [], expected: 0 },
        { label: "только пустые и готовые", tasks: [
            { id: 1, title: "Готовая", done: true },
            { id: 2, title: "\t\u00a0", done: false },
        ], expected: 0 },
        { label: "несколько открытых", tasks: [
            { id: 1, title: "Первая", done: false },
            { id: 2, title: "Вторая", done: false },
            { id: 3, title: "Третья", done: false },
            { id: 4, title: "Готовая", done: true },
            { id: 5, title: " ", done: false },
        ], expected: 3 },
    ])("считает произвольную доску: $label", ({ tasks, expected }) => {
        const before = structuredClone(tasks)
        expect(openCount(tasks)).toBe(expected)
        expect(openCount(tasks)).toBe(visibleTasks(tasks, "open").length)
        expect(tasks).toEqual(before)
    })

    it("показывает одну открытую задачу на исходных данных", () => {
        expect(openCount(seedTasks)).toBe(1)
        expect(openCount(seedTasks)).toBe(visibleTasks(seedTasks, "open").length)
    })

    it("не считает пустые строки любых статусов и завершённые задачи", () => {
        const tasks: Task[] = [
            { id: 1, title: "Открытая", done: false },
            { id: 2, title: "Готовая", done: true },
            ...blanks.flatMap((title, i) => [
                { id: 10 + i * 2, title, done: false },
                { id: 11 + i * 2, title, done: true },
            ]),
        ]
        expect(openCount(tasks)).toBe(1)
        expect(openCount(tasks)).toBe(visibleTasks(tasks, "open").length)
    })

    it("возвращает ноль для пустой доски", () => {
        expect(openCount([])).toBe(0)
    })
})
