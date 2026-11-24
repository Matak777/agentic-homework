import { describe, expect, it } from "vitest"
import { createTask, isBlankTitle, openCount, renameTask, Task, visibleTasks } from "./tasks"

const zeroWidthBlanks = ["\u200b", "\u200b\u200b", " \t\u00a0\u200b\u00a0 ", "\u200b \u200b\t"]

describe("Изменение требования: U+200B тоже пустота", () => {
    it.each(zeroWidthBlanks)("R1: отклоняет создание и переименование в %j", (title) => {
        const tasks: Task[] = [{ id: 1, title: "Сохранить название", done: true }]
        const before = structuredClone(tasks)
        expect(isBlankTitle(title)).toBe(true)
        expect(createTask(2, title)).toBeUndefined()
        expect(renameTask(tasks, 1, title)).toEqual(before)
        expect(tasks).toEqual(before)
    })

    it.each(["all", "open", "done"] as const)("R2: скрывает унаследованный U+200B в фильтре %s", (filter) => {
        const tasks: Task[] = [
            { id: 1, title: "Открытая", done: false },
            { id: 2, title: "Готовая", done: true },
            ...zeroWidthBlanks.flatMap((title, i) => [
                { id: 10 + 2 * i, title, done: false },
                { id: 11 + 2 * i, title, done: true },
            ]),
        ]
        const before = structuredClone(tasks)
        const expected = filter === "all" ? [1, 2] : filter === "open" ? [1] : [2]
        expect(visibleTasks(tasks, filter).map((task) => task.id)).toEqual(expected)
        expect(tasks).toEqual(before)
    })

    it("R3: не считает U+200B открытой задачей", () => {
        const tasks: Task[] = [
            { id: 1, title: "Первая", done: false },
            { id: 2, title: "Вторая", done: false },
            ...zeroWidthBlanks.map((title, i) => ({ id: 10 + i, title, done: false })),
        ]
        expect(openCount(tasks)).toBe(2)
        expect(openCount(tasks)).toBe(visibleTasks(tasks, "open").length)
    })

    it("обрезает U+200B только по краям, сохраняя внутренние символы", () => {
        const title = "Купить\u200b хлеб"
        const padded = `\u200b \t${title}\u00a0\u200b`
        expect(isBlankTitle(title)).toBe(false)
        expect(createTask(1, padded)?.title).toBe(title)
        expect(renameTask([{ id: 1, title: "Было", done: false }], 1, padded)[0].title).toBe(title)
        expect(visibleTasks([{ id: 1, title, done: false }], "open")).toHaveLength(1)
    })
})
