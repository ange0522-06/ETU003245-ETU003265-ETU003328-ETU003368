select * from users;                                                                                                                                             id |       email       | failed_attempts | locked | password |  role                                                                                                   ----+-------------------+-----------------+--------+----------+---------                                                                                                  1 | manager@email.com |               0 | f      | 1234     | manager                                                                                                 (1 ligne)                                                              


insert into users(email,failed_attempts,locked,password,role) values(' manager@email.com',0,false,'1234','manager');
insert into users(email,failed_attempts,locked,password,role) values(' mgr@gmail.com',0,false,'1234','manager');


<!-- test -->

<!-- curl http://localhost:8080/api/health -->
http://localhost:5173
manager@email.com
1234

a chq modif de backend,=>docker compose up -d --build backend
 docker-compose => docker compose up -d
 Dockerfile	✅ OUI	docker compose build --no-cache backend puis docker compose up -d
 Base de données (SQL)	❌ NON	Exécutez directement via docker compose exec postgres psql ...

apart frontend, faut toujours faire 
