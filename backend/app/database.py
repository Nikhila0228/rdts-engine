from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection URL
DATABASE_URL = "postgresql://user:password@localhost:5432/rdts_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    #Initialize a new database session
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        # Close the session after use
        db_session.close()