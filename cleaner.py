import pandas as pd


def analyze_webmaster_file(filepath):
    """
    Эта функция читает Excel-файл от Яндекс.Вебмастера и выводит
    первичную информацию о его структуре.
    """
    print(f"Читаем файл: {filepath}")
    df = pd.read_excel(filepath)
    print("\nПервые 5 строк файла:")
    print(df.head())
    print("\nНазвания столбцов в файле:")
    print(df.columns.tolist())


if __name__ == "__main__":
    excel_file = 'data_full.xlsx'
    analyze_webmaster_file(excel_file)