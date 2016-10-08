require 'pg'
require_relative 'environment'

u_data = File.new('u.data')
u_item = File.new('u.item')

movies_db = PG.connect(dbname: 'movielens')

def get_item_info(u_item)
  movies_hash = {}
  u_item.each do |line|
    movie_string = line.chomp
    movie_string = movie_string.split('|')
    movies_hash[movie_string[0]] = [movie_string[1], movie_string[2],
                                    movie_string[4]]
  end
  movies_hash
end

def populate_movies_db(db_name, movies_hash)
  movies_hash.each do |key, value|
    movie_id = key.to_i
    movie_title = value[0].gsub(/'/, '')
    movie_rd = value[1]
    movie_url = value[2].gsub(/'/, '')
    db_name.exec("INSERT INTO movies VALUES ('#{movie_id}', '#{movie_title}', '#{movie_rd}', '#{movie_url}');")
  end
end

def get_ratings_info(u_data)
  ratings_hash = {}
  i = 0
  CSV.foreach(u_data, col_sep: "\t") do |line|
    user_id = line[0]
    movie_id = line[1]
    score = line[2]
    ratings_hash[i] = [user_id, movie_id, score]
  end
end

def populate_ratings_db(db_name, ratings_hash)
  ratings_hash.each do |key, value|
    user_id = value[0]
    movie_id = value[1]
    movie_rating = value[2]
    db_name.exec("INSERT INTO ratings VALUES ('#{user_id}', '#{movie_id}', '#{movie_rating}');")
  end
end



movies_hash = get_item_info(u_item)
populate_movies_db(movies_db, movies_hash)

ratings_hash = get_ratings_info(u_data)
populate_ratings_db(movies_db, ratings_hash)

#movies = {
  #title varchar(100)
  #release_date text,
  #url text
#}

def populate_movies_db(db_name, movies_hash)
  movies_hash.each do |key, value|
    movie_title = value[0].gsub(/'/, '')
    movie_rd = value[1]
    movie_url = value[2].gsub(/'/, '')
    db_name.exec("INSERT INTO movies VALUES ('#{movie_title}', '#{movie_rd}', '#{movie_url}');")
  end
end

movies_hash = get_item_info(u_item)
populate_movies_db(movies_db, movies_hash)
