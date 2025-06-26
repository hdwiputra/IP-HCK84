1. npx sequelize-cli model:generate --name User --attributes fullName:string,username:string,email:string,password:string
2. npx sequelize-cli model:generate --name Genre --attributes name:string,url:string,mal_id:integer
3. npx sequelize-cli model:generate --name UserGenre --attributes UserId:integer,GenreId:integer
4. npx sequelize model:generate --name Anime --attributes mal_id:integer,title:string,title_english:string,title_japanese:string,image_url:string,trailer_url:string,synopsis:text,type:string,episodes:integer,status:string,source:string,duration:string,rating:string,score:float,rank:integer,popularity:integer,aired_from:date,aired_to:date,season:string,year:integer
5. npx sequelize model:generate --name UserAnime --attributes UserId:integer,AnimeId:integer,watch_status:string,score:float,episodes_watched:integer,notes:text
