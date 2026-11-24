"""Повтор одного красного прогона: python3 scripts/check-mutation.py а|б|в|г.

Требуется установленный npm и зависимости проекта. Исходник восстанавливается
в finally; исторический evidence/red.txt не перезаписывается.
"""
import difflib
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/tasks.ts"


def replace_once(source, old, new):
    if source.count(old) != 1:
        raise ValueError("Ожидаемый участок не найден однозначно; файл не изменён")
    return source.replace(old, new, 1)


def mutate(source, label):
    if label == "а":
        return replace_once(source,
            "export function createTask(id: number, title: string): Task | undefined {\n    const trimmed = trimTitle(title)",
            "export function createTask(id: number, title: string): Task | undefined {\n    const trimmed = title")
    if label == "б":
        return replace_once(source, "    if (trimmed.length === 0) return tasks\n", "")
    if label == "в":
        return replace_once(source, "        if (isBlankTitle(task.title)) return false\n", "")
    if label == "г":
        return replace_once(source, r'return title.replace(/^[\s\u200B]+|[\s\u200B]+$/g, "")', "return title.trim()")
    raise ValueError("Выберите а, б, в или г")


def run_tests():
    env = dict(os.environ, NO_COLOR="1")
    return subprocess.run(["npm", "test"], cwd=ROOT, env=env, text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def main():
    label = sys.argv[1] if len(sys.argv) == 2 else ""
    original_bytes = SOURCE.read_bytes()
    original = original_bytes.decode()
    broken = mutate(original, label)
    green = run_tests()
    if green.returncode:
        print(green.stdout)
        raise RuntimeError("Начальная версия должна быть зелёной; файл не изменён")
    patch = "".join(difflib.unified_diff(original.splitlines(True), broken.splitlines(True),
                                       fromfile="green/src/tasks.ts", tofile="broken/src/tasks.ts"))
    try:
        SOURCE.write_text(broken)
        red = run_tests()
    finally:
        SOURCE.write_bytes(original_bytes)
    restored = run_tests()
    output = f"===== ({label}) повтор =====\n{patch}\n$ npm test\n{red.stdout}\nExit code: {red.returncode}\n"
    output += f"\nВосстановлено; $ npm test\n{restored.stdout}\nExit code: {restored.returncode}\n"
    (ROOT / "evidence/red-replay.txt").write_text(output)
    print(output)
    if red.returncode == 0 or " FAIL " not in red.stdout:
        raise RuntimeError("Нужны упавшие assertions, а не успешный прогон или ошибка раннера")
    if restored.returncode:
        raise RuntimeError("Файл восстановлен, но итоговый прогон не зелёный")
    print("Поломка обнаружена; исходный файл восстановлен, тесты зелёные.")


if __name__ == "__main__":
    main()
