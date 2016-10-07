require 'active_record'
require 'pg'

ActiveRecord::Base.establish_connection(
  adapter:  'postgresql', # or 'mysql2' or 'sqlite3'
  host:     'localhost',
  database: 'movielens',
  username: 'USERNAME',
  password: 'PASSWORD'
)
