\connect localcon

<% for (var i=0;i<neighborhoods.length;i++) { %>
<h2>Check out posts from the following neighborhoods:</h2>
<div class="hood">
<a href='/<%= neighborhoods.id %>'><%= neighborhoods.name %></a>
<% } %>
</div>


<div class="show name">
<% if(user) { %>
Hey <%= typeof user.first === 'string' ? user.first : 'you' %>!
<% } else { %>
You are logged out.
<% } %>
</div>

<a href='/1'>Magnolia</a>
<a href='/2'>Ballard</a>
<a href='/3'>Phinney & Greenwood</a>
<a href='/4'>Wallingford & Green Lake</a>
<a href='/5'>Roosevelt & Ravenna</a>
<a href='/6'>University District</a>
<a href='/7'>Fremont</a>
<a href='/8'>Wedgwood & Sand Point</a>
<a href='/9'>Queen Anne</a>
<a href='/10'>South Lake Union</a>
<a href='/11'>Eastlake</a>
<a href='/12'>Belltown</a>
<a href='/13'>Downtown</a>
<a href='/14'>Pioneer Square</a>
<a href='/15'>Capitol Hill</a>
<a href='/16'>Central District</a>
<a href='/17'>International District</a>
<a href='/18'>Madison Park & Madison Valley</a>
<a href='/19'>Madrona & Leschi</a>
<a href='/20'>Beacon Hill</a>
<a href='/21'>Rainier Valley</a>
<a href='/22'>SODO</a>
<a href='/23'>Georgetown</a>
<a href='/24'>West Seattle</a>

INSERT INTO categories VALUES (1,'Eat & Drink');

INSERT INTO categories VALUES (2,'Day Out');

INSERT INTO categories VALUES (3,'Night Out');

INSERT INTO categories VALUES (4,'Secret Gem');

INSERT INTO categories VALUES (5,'Getting Around');

INSERT INTO neighborhoods VALUES (1,'Magnolia','Wildlife, quiet life','magnoliaseattle');

INSERT INTO neighborhoods VALUES (2,'Ballard','A comfortably cool classic','ballardfarmersmarket');

INSERT INTO neighborhoods VALUES (3,'Phinney & Greenwood','Kicked-back vibe with community spirit','phinneyridge');

INSERT INTO neighborhoods VALUES (4,'Wallingford & Green Lake','Warmth and charm from lake to lake','wallingfordseattle');

INSERT INTO neighborhoods VALUES (5,'Roosevelt & Ravenna','Leafy streets meet urban living','ravennapark');

INSERT INTO neighborhoods VALUES (6,'University District','Home of the Huskies','udistrict');

INSERT INTO neighborhoods VALUES (7,'Fremont','The "Center of the Universe"','fremontseattle');

INSERT INTO neighborhoods VALUES (8,'Wedgwood & Sand Point','Peace and calm on the shores of Lake Washington','matthewsbeach');

INSERT INTO neighborhoods VALUES (9,'Queen Anne','Oasis on top, culture haven down below','queenanneseattle');

INSERT INTO neighborhoods VALUES (10,'South Lake Union','Seaplanes land, opportunity knocks','southlakeunion');

INSERT INTO neighborhoods VALUES (11,'Eastlake','Urban living along Lake Union','eastlakeseattle');

INSERT INTO neighborhoods VALUES (12,'Belltown','The urban mecca','belltownseattle');

INSERT INTO neighborhoods VALUES (13,'Downtown','Pike Place Market and so much more','pikeplacemarket');

INSERT INTO neighborhoods VALUES (14,'Pioneer Square','Mercantiles meet galleries in a historic heaven','pioneersquareseattle');

INSERT INTO neighborhoods VALUES (15,'Capitol Hill','A hipster haven for culture mavens','capitolhillblockparty');

INSERT INTO neighborhoods VALUES (16,'Central District','The oldest neighborhood is new again','centraldistrictseattle');

INSERT INTO neighborhoods VALUES (17,'International District','Treasures from afar, close to home','internationaldistrictseattle');

INSERT INTO neighborhoods VALUES (18,'Madison Park & Madison Valley','Stylish living along Lake Washington','madisonparkbeach');

INSERT INTO neighborhoods VALUES (19,'Madrona & Leschi','A village in the city','madronapark');

INSERT INTO neighborhoods VALUES (20,'Beacon Hill','Hilltop hip in the South End','beaconhillseattle');

INSERT INTO neighborhoods VALUES (21,'Rainier Valley','A deliciously eclectic urban pocket','columbiacityseattle');

INSERT INTO neighborhoods VALUES (22,'SODO','More than just the Seahawks','sodoseattle');

INSERT INTO neighborhoods VALUES (23,'Georgetown','A pearl in the sea of industry','georgetownseattle');

INSERT INTO neighborhoods VALUES (24,'West Seattle','Harmonious diversity from bay to sound','lincolnparkseattle');