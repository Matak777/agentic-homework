export type Filter = "all" | "open" | "done"

export interface Task {
    id: number
    title: string
    done: boolean
}

/**
 * Доска в том виде, в каком она приходит из хранилища. Строку 3 сохранила старая
 * форма ещё до issue #7: это название из одних пробелов, и оно всё ещё здесь.
 */
export const seedTasks: Task[] = [
    { id: 1, title: "Сдать лабораторную", done: false },
    { id: 2, title: "Купить продукты", done: true },
    { id: 3, title: "   ", done: false },
]

/** Убирает с краёв пробельные символы и U+200B, сохраняя внутренние символы. */
function trimTitle(title: string): string {
    return title.replace(/^[\s\u200B]+|[\s\u200B]+$/g, "")
}

/** Название из пробельных символов и U+200B считается отсутствующим. */
export function isBlankTitle(title: string): boolean {
    return trimTitle(title).length === 0
}

/** Создание задачи с содержательным названием без пробелов по краям. */
export function createTask(id: number, title: string): Task | undefined {
    const trimmed = trimTitle(title)
    if (trimmed.length === 0) return undefined
    return { id, title: trimmed, done: false }
}

/** Пустое название оставляет существующие задачи без изменений. */
export function renameTask(tasks: Task[], id: number, title: string): Task[] {
    const trimmed = trimTitle(title)
    if (trimmed.length === 0) return tasks
    return tasks.map((task) => (task.id === id ? { ...task, title: trimmed } : task))
}

export function visibleTasks(tasks: Task[], filter: Filter): Task[] {
    return tasks.filter((task) => {
        if (isBlankTitle(task.title)) return false
        if (filter === "open") return !task.done
        if (filter === "done") return task.done
        return true
    })
}

/** Счётчик совпадает с количеством задач в фильтре «Открытые». */
export function openCount(tasks: Task[]): number {
    return visibleTasks(tasks, "open").length
}
