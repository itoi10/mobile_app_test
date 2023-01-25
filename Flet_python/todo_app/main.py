"""FletでToDoアプリを作るチュートリアル

公式サイト
https://flet.dev/docs/tutorials/python-todo/
"""

import flet as ft


class TodoApp(ft.UserControl):
    """TodoAppコンポーネント

    UserControlを使うと再利用可能なコンポーネントを作ることができる
    buildは実装必須.戻り値はControl(TextやColumnなどUIの部品的なもの)のリストか単一のオブジェクト
    """

    def build(self):
        # タスクリスト
        self.tasks = ft.Column()
        # 入力フィールド
        self.new_task_field = ft.TextField(hint_text="なにを終わらせようかな？", expand=True)

        # 追加ボタン
        self.add_button = ft.FloatingActionButton(
            icon=ft.icons.ADD,
            on_click=self.add_clicked,
        )

        # ReactでいうJSXを返すようなもの
        return ft.Column(
            width=600,
            controls=[
                ft.Row(
                    controls=[
                        self.new_task_field,
                        self.add_button,
                    ]
                ),
                self.tasks,
            ],
        )

    def add_clicked(self, e):
        """タスク一覧に新しいタスクを追加する"""
        task = Task(self.new_task_field.value, self.task_delete)
        self.tasks.controls.append(task)
        self.new_task_field.value = ""
        self.update()

    def task_delete(self, task):
        """タスクを削除
        これは子コンポーネント(Task)に渡して使う この辺Reactに似てる
        """
        self.tasks.controls.remove(task)
        self.update()


class Task(ft.UserControl):
    """１つのタスク"""

    def __init__(self, task_name, task_delete):
        super().__init__()
        self.task_name = task_name
        # 親から受けとった自分自身削除用の関数
        self.task_delete = task_delete

    def build(self):
        self.display_task = ft.Checkbox(value=False, label=self.task_name)
        self.edit_name = ft.TextField(expand=1)

        # 通常ビュー（編集中は非表示）
        self.display_view = ft.Row(
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            controls=[
                # タスク名とチェックボックス
                self.display_task,
                ft.Row(
                    spacing=0,
                    controls=[
                        # 編集ボタン
                        ft.IconButton(
                            icon=ft.icons.CREATE_OUTLINED,
                            tooltip="編集",
                            on_click=self.edit_clicked,
                        ),
                        # 削除ボタン
                        ft.IconButton(
                            ft.icons.DELETE_OUTLINE,
                            tooltip="削除",
                            on_click=self.delete_clicked,
                        ),
                    ],
                ),
            ],
        )

        # 編集ビュー (通常は非表示)
        self.edit_view = ft.Row(
            # デフォルト非表示
            visible=False,
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            controls=[
                self.edit_name,
                ft.IconButton(
                    icon=ft.icons.DONE_OUTLINE_OUTLINED,
                    icon_color=ft.colors.GREEN,
                    tooltip="Update To-Do",
                    on_click=self.save_clicked,
                ),
            ],
        )

        return ft.Column(
            controls=[
                self.display_view,
                self.edit_view,
            ]
        )

    def edit_clicked(self, e):
        """タスク編集モードにする"""
        # タスク名を編集用変数にコピー
        self.edit_name.value = self.display_task.label
        # 表示切り替え
        self.display_view.visible = False
        self.edit_view.visible = True
        # 画面更新
        self.update()

    def save_clicked(self, e):
        """タスク編集を完了する"""
        # 編集を反映
        self.display_task.label = self.edit_name.value
        # 表示切り替え
        self.display_view.visible = True
        self.edit_view.visible = False
        # 画面更新
        self.update()

    def delete_clicked(self, e):
        """タスクを削除する
        親から受け取った関数を実行することで、親のタスク一覧から自分自身を消す
        """
        self.task_delete(self)


def main(page: ft.Page):
    page.title = "Flet ToDoアプリ"
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.update()

    app = TodoApp()
    page.add(app)


if __name__ == "__main__":
    # アプリ起動
    ft.app(target=main)
