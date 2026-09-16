from database import engine, Base
import models.user
import models.section
import models.qr_session
import models.attendance
import models.institution
import models.audit_log
import models.settings
import models.fraud_log
import models.login_log
from sqlalchemy import inspect, text

def sync():
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table_name, table in Base.metadata.tables.items():
            if inspector.has_table(table_name):
                existing_cols = {col['name'] for col in inspector.get_columns(table_name)}
                for column in table.columns:
                    col_name = column.name
                    if col_name not in existing_cols:
                        col_type = column.type.compile(engine.dialect)
                        sql = f'ALTER TABLE "{table_name}" ADD COLUMN IF NOT EXISTS "{col_name}" {col_type};'
                        print(f'Adding missing column: {table_name}.{col_name}')
                        conn.execute(text(sql))
            else:
                print(f'Table {table_name} does not exist, creating standard DDL...')
                table.create(conn)
    print("Database schema sync complete!")

if __name__ == "__main__":
    sync()
