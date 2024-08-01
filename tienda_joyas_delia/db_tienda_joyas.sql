create table joyas (
id serial primary key,
    name varchar(50) not null,
    model varchar(50) not null,
    category varchar(50) not null,
    metal varchar(50) not null,
	cadena int default 0,
    medida int,
    value numeric(11,2) not null default 99999999.99 check(stock > 0),
    stock int not null default 0 check(stock >=0)
);



insert into joyas ( name, model, category, metal, cadena, medida, value, stock) values
('Anillo Wish','Wish','anillo','plata',default,0,30000,4),
('Anillo Quarzo Greece','Quarzo Greece','anillo','oro', default, 0,40000,2);

 select * from joyas;

  
