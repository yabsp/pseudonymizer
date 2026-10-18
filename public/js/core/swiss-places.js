// Swiss place names (localities and communes) for finding towns named without a postal code ("aus Hochdorf").
// Source: swisstopo, "Amtliches Ortschaftenverzeichnis mit Postleitzahl und Perimeter" (CSV, LV95, validity
// 2026-09-30), https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/, free geodata under the
// swisstopo terms of use (open use, commercial use allowed, source must be named).
// Built from the columns Ortschaftsname and Gemeindename: numbered districts ("Lausanne 25"), canton suffixes
// ("Wald ZH") and brackets removed, bilingual names ("Biel/Bienne") split. Left out: names with fewer than 4
// letters, words of the never-sensitive list, and 87 names that are also frequent French, English or
// German words ("Berg", "Chemin", "Lohn", "Root"), found by their rank in the spaCy fr/en/de lg word vectors and by hand.
export const SWISS_PLACE_NAMES = `
Aadorf
Aarau
Aarau Rohr
Aarberg
Aarburg
Aarwangen
Aathal-Seegräben
Aawangen
Abländschen
Abtwil
Achseten
Aclens
Acquarossa
Adelboden
Adetswil
Adligenswil
Adlikon b. Andelfingen
Adlikon b. Regensdorf
Adliswil
Aedermannsdorf
Aefligen
Aegerten
Aesch
Aeschau
Aeschi
Aeschi b. Spiez
Aeschi bei Spiez
Aeschiried
Aeschlen b. Oberdiessbach
Aeschlen ob Gunten
Aetigkofen
Aetingen
Aettenschwil
Aeugst am Albis
Aeugstertal
Affeltrangen
Affoltern am Albis
Affoltern im Emmental
Agarn
Agarone
Agasul
Agiez
Agno
Agriswil
Aigle
Aïre
Aire-la-Ville
Airolo
Alberswil
Albeuve
Albinen
Albligen
Albula
Alchenflüh
Alchenstorf
Aldesago
Algetshausen
Alikon
Allaman
Allens
Allenwinden
Allerheiligenberg
Allmendingen
Allmendingen b. Bern
Allschwil
Almens
Alosen
Alp Grüm
Alpnach
Alpnach Dorf
Alpnachstad
Alpthal
Alt St. Johann
Altbüron
Altdorf
Altendorf
Altenrhein
Alterswil
Alterswilen
Altikon
Altishausen
Altishofen
Altnau
Alto Malcantone
Altstätten
Altwis
Alvaneu Bad
Alvaneu Dorf
Alvaschein
Alvra
Ambrì
Amden
Aminona
Amlikon-Bissegg
Ammerswil
Ammerzwil
Amriswil
Amsoldingen
Amsteg
Andeer
Andelfingen
Andermatt
Andhausen
Andiast
Andwil
Anglikon
Anières
Anniviers
Anwil
Anzère
Anzonico
Appenzell
Appenzell Eggerstanden
Appenzell Enggenhütten
Appenzell Meistersrüte
Appenzell Schlatt
Appenzell Steinegg
Aproz
Aquila
Aran
Aranno
Arbaz
Arbedo
Arbedo-Castione
Arboldswil
Arbon
Arcegno
Arch
Arconciel
Ardez
Ardon
Areuse
Argnou
Arisdorf
Aristau
Arlesheim
Arnegg
Arnex-sur-Nyon
Arnex-sur-Orbe
Arni
Arogno
Arolla
Arosa
Arosio
Arth
Arveyes
Arvigo
Arvillard
Arzier-Le Muids
Arzo
Ascharina
Ascona
Assens
Astano
Asuel
Athenaz
Attalens
Attelwil
Attikon
Attinghausen
Attiswil
Aubonne
Auboranges
Auddes-sur-Riddes
Auenstein
Augio
Augst
Aumont
Auressio
Aurigeno
Auslikon
Ausserberg
Ausserbinn
Ausserferrera
Auswil
Autafond
Autavaux
Autigny
Auvernier
Avegno
Avegno Gordevio
Aven
Avenches
Avers
Avry
Avry-devant-Pont
Avry-sur-Matran
Avully
Avusy
Axalp
Ayent
Ayer
Azmoos
Baar
Bäch
Bachenbülach
Bächli
Bachs
Bad Ragaz
Bad Zurzach
Baldegg
Baldingen
Balerna
Balgach
Ballaigues
Ballens
Ballmoos
Ballwil
Balm b. Günsberg
Balm b. Messen
Balm bei Günsberg
Balmberg
Balsthal
Balterswil
Baltschieder
Balzers
Banco
Bangerten b. Dieterswil
Bänk
Bannwil
Bärau
Barbengo
Barberêche
Bardonnex
Bäretswil
Bargen
Bäriswil
Barmelweid
Bärschwil
Barzheim
Bas-Intyamon
Basadingen
Basadingen-Schlattingen
Basel
Basse-Allaine
Basse-Nendaz
Basse-Vendline
Bassecourt
Bassersdorf
Bätterkinden
Bättwil
Baulmes
Bauma
Bavois
Bazenheid
Beatenberg
Beckenried
Bedano
Bedigliora
Bedretto
Beggingen
Begnins
Beinwil
Beinwil am See
Belalp
Belfaux
Bellach
Bellelay
Bellerive
Bellevue
Bellikon
Bellinzona
Bellmund
Bellwald
Belmont-Broye
Belmont-sur-Lausanne
Belmont-sur-Yverdon
Belp
Belpberg
Belprahon
Benglen
Benken
Bennau
Bennwil
Benzenschwil
Bercher
Berg am Irchel
Bergdietikon
Bergün
Bergün Filisur
Beride di Bedigliora
Berikon
Beringen
Berken
Berlens
Berlingen
Bern
Berneck
Bernex
Bernhardzell
Berolle
Beromünster
Berschis
Bertschikon
Berzona
Besazio
Besenbüren
Besencens
Betschwanden
Bettenhausen
Bettens
Bettingen
Bettlach
Bettmeralp
Bettwiesen
Bettwil
Beurnevésin
Beuson
Bevaix
Bever
Bévilard
Biasca
Biberen
Biberist
Bibern
Biberstein
Bichelsee
Bichelsee-Balterswil
Bichwil
Bidogno
Biel
Biel-Benken
Biembach im Emmental
Bienne
Bière
Biessenhofen
Bieudron
Biezwil
Bigenthal
Biglen
Bignasco
Bigorio
Billens
Billens-Hennens
Bilten
Binn
Binningen
Binz
Bioggio
Bioley-Magnoux
Bioley-Orjulaz
Bionnens
Birgisch
Birmensdorf
Birmenstorf
Bironico
Birr
Birrhard
Birrwil
Birsfelden
Birwinken
Bischofszell
Bisisthal
Bissone
Bister
Bitsch
Bivio
Blankenburg
Blatten
Blatten b. Naters
Blausee-Mitholz
Bleienbach
Bleiken b. Oberdiessbach
Blenio
Blessens
Blignou
Blitzingen
Blonay
Blonay - Saint-Légier
Blumenstein
Böbikon
Böckten
Bodio
Boécourt
Bofflens
Bogis-Bossey
Bogno
Bois-d'Amont
Bôle
Bolken
Boll
Bolligen
Bollingen
Bollion
Bollodingen
Boltigen
Bombinasco
Bonaduz
Bonau
Boncourt
Bondo
Bonfol
Bönigen
Bönigen b. Interlaken
Boningen
Boniswil
Bonnefontaine
Bonstetten
Bonvillars
Boppelsen
Borex
Borgnone
Borgonovo
Bosco
Bosco Luganese
Bösingen
Bossonnens
Boswil
Bottens
Bottenwil
Botterens
Bottighofen
Bottmingen
Böttstein
Botyre
Boudevilliers
Boudry
Bougy-Villars
Boulens
Bouloz
Bourg-en-Lavaux
Bourg-Saint-Pierre
Bourg-St-Pierre
Bourguillon
Bournens
Bourrignon
Boussens
Bouveret
Boveresse
Bovernier
Bowil
Bözberg
Bözen
Böztal
Braggio
Brail
Bramboden
Bramois
Bratsch
Braunau
Braunwald
Bravuogn
Brè sopra Lugano
Bregaglia
Breganzona
Breggia
Breil
Breitenbach
Bremblens
Bremgarten
Bremgarten b. Bern
Bremgarten bei Bern
Brenles
Breno
Brent
Brenzikofen
Bressaucourt
Bretigny-sur-Morrens
Bretonnières
Bretzwil
Brienz
Brienzwiler
Brig
Brig-Glis
Brigels
Brigerbad
Brignon
Brinzauls
Brione
Brione sopra Minusio
Brislach
Brissago
Bristen
Brittern
Brittnau
Broc
Broglio
Bronschhofen
Brontallo
Brot-Dessous
Brot-Plamboz
Bruderholz
Brugg
Brügg
Brügglen
Brülisau
Brunegg
Brünig
Brünisried
Brunnadern
Brunnenthal
Brusino Arsizio
Brusio
Bruson
Brüttelen
Brütten
Brüttisellen
Bruzella
Bubendorf
Bubikon
Buch am Irchel
Buch b. Frauenfeld
Buch b. Kümmertshausen
Buch b. Märwil
Buchackern
Buchberg
Buchegg
Buchen im Prättigau
Buchholterberg
Buchillon
Buchrain
Buchs
Büchslen
Buckten
Büetigen
Bühl
Bühl b. Aarberg
Bühler
Buhwil
Buix
Bülach
Bulle
Bullet
Bünzen
Buochs
Buonas
Bürchen
Bure
Büren
Büren an der Aare
Büren zum Hof
Burg im Leimental
Burgäschi
Burgdorf
Bürgenstock
Burgistein
Burglauenen
Bürglen
Büriswilen
Büron
Bursinel
Bursins
Burtigny
Buseno
Büsserach
Bussigny
Bussigny-sur-Oron
Bussnang
Busswil
Busswil b. Melchnau
Busswil bei Melchnau
Bussy
Bussy-Chardonney
Bussy-sur-Moudon
Bütschwil
Bütschwil-Ganterschwil
Büttenhardt
Buttes
Buttikon
Büttikon
Buttisholz
Buttwil
Bützberg
Buus
Cabbio
Cademario
Cadempino
Cadenazzo
Cadro
Cagiallo
Calanca
Calfreisen
Calonico
Calpiogna
Cama
Camedo
Camignolo
Camischolas
Camorino
Campascio
Campello
Camperio
Campo
Campocologno
Campora
Camuns
Caneggio
Canobbio
Capolago
Capriasca
Carabbia
Carabietta
Carena
Carì
Carona
Carouge
Carrouge
Cartigny
Casaccia
Casima
Caslano
Cassina d'Agno
Castagnola
Castaneda
Castasegna
Castel San Pietro
Castelrotto
Castiel
Castione
Castrisch
Castro
Cauco
Caux
Cavagnago
Cavardiras
Cavergno
Caviano
Cavigliano
Cazis
Celerina
Céligny
Centovalli
Cerentino
Cerniat
Cerniaz
Cernier
Certara
Cevio
Châbles
Chabrey
Chailly-Montreux
Chalais
Cham
Chambésy
Chamblon
Chambrelien
Chamby
Chamoille
Chamoson
Champ-du-Moulin
Champéry
Champex-Lac
Champfèr
Champlan
Champoussin
Champoz
Champsec
Champtauroz
Champvent
Champzabé
Chancy
Chandolin
Chandon
Chandonne
Chanéaz
Chapella
Chapelle-sur-Moudon
Chardonne
Charmey
Charmoille
Charrat
Château-d'Oex
Châtel-Saint-Denis
Châtel-St-Denis
Châtel-sur-Montsalvens
Châtelaine
Châtelat
Châtillens
Châtillon
Châtonnaye
Chaumont
Chavannes-de-Bogis
Chavannes-des-Bois
Chavannes-le-Chêne
Chavannes-le-Veyron
Chavannes-les-Forts
Chavannes-près-Renens
Chavannes-sous-Orsonnens
Chavannes-sur-Moudon
Chavornay
Cheiry
Chenaux
Chêne-Bougeries
Chêne-Bourg
Chêne-Pâquier
Chénens
Chermignon
Chermignon-d'en-Bas
Chernex
Chesalles-sur-Moudon
Chesalles-sur-Oron
Cheseaux-Noréaz
Cheseaux-sur-Lausanne
Chéserex
Chesières
Chésopelloz
Chessel
Chevenez
Chevilly
Chevroux
Chexbres
Cheyres
Cheyres-Châbles
Chez Petit
Chez-le-Bart
Chézard-St-Martin
Chiasso
Chiggiogna
Chigny
Chippis
Chironico
Choëx
Choulex
Chur
Churwalden
Cimadera
Cimalmotto
Cimo
Cinuos-chel
Clarens
Clarmont
Claro
Clavaleyres
Clèbes
Clos du Doubs
Clugin
Coeuve
Coffrane
Coglio
Coinsins
Cointrin
Coldrerio
Colla
Collex
Collex-Bossy
Collina d'Oro
Collombey
Collombey-Muraz
Collonge-Bellerive
Collonges
Cologny
Colombier
Comano
Combremont-le-Grand
Combremont-le-Petit
Commugny
Comologno
Comunanza Cadenazzo
Conches
Condémines
Confignon
Constantine
Conters im Prättigau
Conthey
Contone
Contra
Coppet
Corban
Corbeyrier
Corbières
Corcelles
Corcelles-le-Jorat
Corcelles-près-Concise
Corcelles-près-Payerne
Corcelles-sur-Chavornay
Cordast
Corgémont
Corin-de-la-Crête
Corippo
Corjolens
Cormagens
Cormérod
Corminboeuf
Cormondrèche
Cormoret
Cornaux
Cornol
Corpataux
Correvon
Corseaux
Corserey
Corsier
Corsier-sur-Vevey
Cortaillod
Cortébert
Corteglia
Corticiasca
Corzoneso
Cossonay
Cossonay-Ville
Cottens
Cotterd
Courcelon
Courchapoix
Courchavon
Courfaivre
Courgenay
Courgevaux
Courlevon
Cournillens
Courrendlin
Courroux
Courtaman
Courtedoux
Courtelary
Courtemaîche
Courtemautruy
Courtepin
Courtételle
Courtion
Cousset
Couvet
Cozzo
Crana
Crans
Crans-Montana
Crassier
Cremin
Crémines
Cresciano
Cressier
Crésuz
Crête-à-l'Oeil
Crissier
Cronay
Croy
Cuarnens
Cuarny
Cudrefin
Cugnasco
Cugnasco-Gerra
Cugy
Cully
Cumbel
Cumpadials
Cunter
Curaglia
Cureggia
Cureglia
Curio
Curtilles
Curtina
Dachsen
Dägerlen
Dagmersellen
Daillens
Daillon
Daiwil
Dalin
Dallenwil
Dällikon
Dalpe
Damphreux
Damphreux-Lugnez
Damvant
Dangio
Däniken
Dänikon
Danis
Dardagny
Dardin
Därligen
Därstetten
Dättlikon
Dättwil
Davesco-Soragno
Davos
Davos Clavadel
Davos Dorf
Davos Frauenkirch
Davos Glaris
Davos Monstein
Davos Platz
Davos Wiesen
Davos Wolfgang
Degen
Degersheim
Deisswil b. Münchenbuchsee
Deisswil bei Münchenbuchsee
Deitingen
Delémont
Delley
Delley-Portalban
Démoret
Denens
Denezy
Denges
Densbüren
Derendingen
Detligen
Dettighofen
Develier
Dickbuch
Diegten
Dielsdorf
Diemerswil
Diemtigen
Diepflingen
Diepoldsau
Dierikon
Diesbach
Diessbach b. Büren
Diessbach bei Büren
Diesse
Diessenhofen
Dieterswil
Dietfurt
Dietikon
Dietlikon
Dietschwil
Dietwil
Dinhard
Dino
Dintikon
Disentis
Dittingen
Dizy
Domat
Dombresson
Domdidier
Domleschg
Dommartin
Dompierre
Donat
Donatyre
Dongio
Donneloye
Donzhausen
Doppleschwand
Dorénaz
Dörflingen
Dornach
Dotnacht
Dottikon
Döttingen
Dotzigen
Dozwil
Dranse
Drei Höfe
Dreien
Dübendorf
Düdingen
Duggingen
Dugny
Duillier
Dulliken
Dully
Dürnten
Dürrenäsch
Dürrenroth
Dussnang
Duvin
Ebersecken
Ebersol
Ebertswil
Ebikon
Ebmatingen
Ebnat-Kappel
Ebnet
Echallens
Echandens
Echarlens
Echichens
Eclagnens
Eclépens
Ecoteaux
Ecublens
Ecuvillens
Ederswiler
Edlibach
Effingen
Effretikon
Egerkingen
Egg b. Zürich
Eggenwil
Eggerberg
Eggersriet
Eggiwil
Eglisau
Egliswil
Egnach
Egolzwil
Ehrendingen
Ehrikon
Eich
Eichberg
Eigenthal
Eigergletscher
Eiken
Einsiedeln
Eischoll
Eison
Eisten
Elfingen
Elgg
Ellighausen
Ellikon am Rhein
Ellikon an der Thur
Elsau
Embd
Embrach
Emdthal
Emmen
Emmenbrücke
Emmenmatt
Emmetten
Endingen
Engelberg
Engelburg
Enggistein
Engi
Engishofen
Englisberg
Engollon
Engwang
Engwilen
Ennenda
Ennetaach
Ennetbaden
Ennetbühl
Ennetbürgen
Ennetmoos
Enney
Entlebuch
Epagny
Epalinges
Epautheyres
Epauvillers
Ependes
Epesses
Epiquerez
Eppenberg
Eppenberg-Wöschnau
Epsach
Eptingen
Ergisch
Eriswil
Eriz
Erlach
Erlen
Erlenbach
Erlenbach im Simmental
Erlinsbach
Ermatingen
Ermensee
Ermenswil
Ernen
Ernetschwil
Erschmatt
Erschwil
Ersigen
Erstfeld
Eschen
Eschenbach
Eschenz
Eschert
Eschikofen
Eschlikon
Escholzmatt
Escholzmatt-Marbach
Esmonts
Essert
Essert-Pittet
Essert-sous-Champvent
Essertes
Essertines-sur-Rolle
Essertines-sur-Yverdon
Esslingen
Estavannens
Estavayer
Estavayer-le-Gibloux
Estavayer-le-Lac
Estévenens
Etagnières
Etoy
Ettenhausen
Ettingen
Ettiswil
Etzelkofen
Etzgen
Etziken
Etzwilen
Euseigne
Euthal
Evilard
Evionnaz
Evolène
Eyholz
Eysins
Fahrni
Fahrni b. Thun
Fahrwangen
Fahrweid
Fahy
Faido
Fajauna
Falera
Fällanden
Fanas
Fankhaus
Faoug
Farnern
Farvagny-le-Grand
Farvagny-le-Petit
Faulensee
Féchy
Fehraltorf
Fehren
Felben-Wellhausen
Feldbach
Feldbrunnen
Feldbrunnen-St. Niklaus
Feldis
Felsberg
Fenalet-sur-Bex
Fenil-sur-Corsier
Fenin
Fenkrieden
Ferden
Ferenbalm
Ferlens
Ferpicloz
Ferreyres
Fescoggia
Fétigny
Fétigny-Ménières
Feuerthalen
Feusisberg
Feutersoey
Fiaugères
Fidaz
Fideris
Fiesch
Fieschertal
Fiez
Figino
Filisur
Filzbach
Finhaut
Finsterhennen
Finstersee
Finsterwald b. Entlebuch
Fionnay
Fischbach
Fischbach-Göslikon
Fischenthal
Fischingen
Fisibach
Fislisbach
Flaach
Flamatt
Flanthey
Fläsch
Flawil
Flendruz
Flerden
Fleurier
Flims
Flims Dorf
Flims Waldhaus
Flond
Flüelen
Flüeli-Ranft
Flüh
Flühli
Flumenthal
Flums
Flums Hochwiese
Flumserberg Bergheim
Flumserberg Portels
Flumserberg Saxli
Flumserberg Tannenbodenalp
Flumserberg Tannenheim
Flurlingen
Fontaine Dessous
Fontaine Dessus
Fontainemelon
Fontaines-sur-Grandson
Fontanezier
Fontannen b. Wolhusen
Fontenais
Fontnas
Forch
Forel
Forel-sur-Lucens
Formangueires
Fornet-Dessous
Fornet-Dessus
Fornex
Forst b. Längenbühl
Forst-Längenbühl
Fortunau
Founex
Fräschels
Frasco
Frasnacht
Frasses
Fraubrunnen
Frauenfeld
Frauenkappelen
Fregiécourt
Freidorf
Freienbach
Freienstein
Freienstein-Teufen
Freienwil
Freimettigen
Frenières-sur-Bex
Frenkendorf
Fresens
Fretereules
Freudwil
Fribourg
Frick
Frieswil
Friltschen
Frinvillier
Froideville
Frümsen
Fruthwilen
Frutigen
Ftan
Fuldera
Fulenbach
Full-Reuenthal
Füllinsdorf
Fully
Fürigen
Furna
Fürstenau
Fürstenaubruck
Fusio
Gabi
Gächlingen
Gächliwil
Gachnang
Gadenstätt
Gadmen
Gähwil
Gais
Gaiserwald
Galgenen
Galmiz
Gals
Gambarogno
Gammen
Gampel
Gampel-Bratsch
Gampelen
Gamprin
Gamprin-Bendern
Gams
Gamsen
Gandria
Gänsbrunnen
Gansingen
Ganterschwil
Gasel
Gattikon
Gebenstorf
Gebertingen
Geiss
Gelfingen
Gelterfingen
Gelterkinden
Geltwil
Gempen
Gempenach
Genestrerio
Genève
Genolier
Genthod
Gentilino
Gerlafingen
Gerlikon
Geroldswil
Gerolfingen
Gerra
Gersau
Gerzensee
Geschinen
Gettnau
Geuensee
Ghirone
Gibloux
Gibswil
Giebenach
Giez
Giffers
Gillarens
Gilly
Gimel
Gimmelwald
Gingins
Giornico
Gipf-Oberfrick
Gisikon
Giswil
Giubiasco
Giumaglio
Givisiez
Givrins
Gland
Glarus
Glarus Nord
Glarus Süd
Glashütten
Glattbrugg
Glattfelden
Glattpark
Gletterens
Glion
Glis
Glovelier
Gluringen
Gnosca
Gockhausen
Gohl
Golaten
Goldach
Goldau
Goldingen
Goldiwil
Goldswil b. Interlaken
Golino
Gollion
Gommiswald
Goms
Gondiswil
Gondo
Gonten
Gontenbad
Gontenschwil
Goppenstein
Goppisberg
Gordevio
Gordola
Gorduno
Gorgier
Göschenen
Gossau
Gossens
Gossliwil
Götighofen
Gottlieben
Goumoëns
Goumoens-la-Ville
Goumoens-le-Jux
Goumois
Grabs
Grabserberg
Grächen
Grafenort
Grafenried
Grafstal
Graltshausen
Grancia
Grancy
Grand-Lancy
Grandcour
Grandevent
Grandfontaine
Grandsivaz
Grandson
Grandval
Grandvaux
Grandvillard
Granges
Granges-de-Vesin
Granges-Paccot
Granges-près-Marnand
Grangettes
Grangettes-près-Romont
Gränichen
Gräslikon
Grasswil
Grattavache
Gravesano
Greich
Greifensee
Grellingen
Grenchen
Greng
Grengiols
Grenilles
Grens
Greppen
Gresso
Gressy
Gretschins
Gretzenbach
Grimentz
Grimisuat
Grindel
Grindelwald
Grolley
Grolley-Ponthaux
Grône
Grono
Grossaffoltern
Grossdietwil
Grosshöchstetten
Grosswangen
Grub
Gruben
Grugnay
Grund b. Gstaad
Grünenmatt
Grüningen
Grüsch
Grüt
Gruyères
Gryon
Gstaad
Gsteig
Gsteig b. Gstaad
Gsteigwiler
Guarda
Gudo
Guggisberg
Gumefens
Gümligen
Gümmenen
Gundetswil
Gündisau
Gündlischwand
Günsberg
Guntalingen
Gunten
Guntershausen b. Aadorf
Guntershausen b. Berg
Gunterswilen
Guntmadingen
Gunzgen
Gunzwil
Gurbrü
Gurin
Gurmels
Gurtnellen
Gurzelen
Guschelmuth
Gutenburg
Gutenswil
Guttannen
Guttet-Feschel
Güttingen
Gwatt
Gysenstein
Haag
Habkern
Habsburg
Häfelfingen
Hagenbuch
Hägendorf
Hagendorn
Hagenwil b. Amriswil
Häggenschwil
Hägglingen
Hagneck
Halden
Haldenstein
Haldi b. Schattdorf
Hallau
Hallwil
Hämikon
Happerswil
Harenwilen
Härkingen
Hasle
Hasle b. Burgdorf
Hasle bei Burgdorf
Haslen
Hasliberg
Hasliberg Goldern
Hasliberg Hohfluh
Hasliberg Reuti
Hasliberg Wasserwendi
Hattenhausen
Hätzingen
Hauenstein
Hauenstein-Ifenthal
Hauptikon
Hauptwil
Hauptwil-Gottshaus
Hausen
Hausen am Albis
Häusernmoos im Emmental
Häuslenen
Haut-Intyamon
Haute-Ajoie
Haute-Nendaz
Haute-Sorne
Hautemorges
Hauterive
Hauteville
Häutligen
Hedingen
Heerbrugg
Hefenhausen
Hefenhofen
Heiden
Heiligenschwendi
Heiligkreuz
Heimberg
Heimenhausen
Heimenschwand
Heimisbach
Heimiswil
Heinrichswil
Heitenried
Heldswil
Helgisried-Rohrbach
Hellbühl
Hellikon
Hellsau
Hemberg
Hemishofen
Hemmental
Hemmiken
Henau
Hendschiken
Henggart
Hennens
Henniez
Herbetswil
Herbligen
Herbriggen
Herdern
Hérémence
Hergiswil
Hergiswil b. Willisau
Hergiswil bei Willisau
Herisau
Herlisberg
Hermance
Hermenches
Hermetschwil-Staffeln
Hermiswil
Hermrigen
Herrenhof
Herrenschwanden
Herrliberg
Hersberg
Hersiwil
Hertenstein
Herznach
Herznach-Ueken
Herzogenbuchsee
Hessigkofen
Hettenschwil
Hettiswil b. Hindelbank
Hettlingen
Hildisrieden
Hilfikon
Hilterfingen
Himmelried
Hindelbank
Hinteregg
Hinterforst
Hinterfultigen
Hinterkappelen
Hintermoos
Hinterrhein
Hinwil
Hirschthal
Hirzel
Hittnau
Hitzkirch
Hochdorf
Hochfelden
Höchstetten
Hochwald
Hofen
Höfen b. Thun
Hoffeld
Hofstatt
Hofstetten
Hofstetten b. Brienz
Hofstetten bei Brienz
Hofstetten-Flüh
Hohenrain
Hohentannen
Hohtenn
Holderbank
Hölstein
Holzhäusern
Holziken
Homberg
Homberg b. Thun
Hombrechtikon
Homburg
Honau
Hondrich
Horboden
Horgen
Horgenberg
Hörhausen
Höri
Hornussen
Horrenbach
Horrenbach-Buchen
Horriwil
Horw
Hosenruck
Hospental
Hottwil
Hubersdorf
Huémoz
Hugelshofen
Humlikon
Hundwil
Hünenberg
Hünenberg See
Hünibach
Hüniken
Hünikon
Hüntwangen
Hunzenschwil
Hurden
Hüswil
Hüttikon
Hüttlingen
Huttwil
Hüttwilen
Ibach
Ichertswil
Icogne
Iffwil
Igis
Ilanz
Illgau
Illhart
Illighausen
Illnau
Illnau-Effretikon
Im Fang
Immensee
Indemini
Inden
Ingenbohl
Inkwil
Innerberg
Innerferrera
Innerthal
Innertkirchen
Insone
Interlaken
Intragna
Intschi
Inwil
Ipsach
Iragna
Iseltwald
Isenfluh
Isenthal
Iseo
Isérables
Islikon
Islisberg
Isole di Brissago
Isone
Istighofen
Itingen
Ittenthal
Ittigen
Jaberg
Jakobsbad
Jaun
Jegenstorf
Jenaz
Jenins
Jeuss
Jona
Jonen
Jongny
Jonschwil
Jorat-Menthue
Jorat-Mézières
Jouxtens-Mézery
Jungfraujoch
Juriens
Jussy
Kägiswil
Kaiseraugst
Kaiserstuhl
Kaisten
Kallern
Kallnach
Kalpetran
Kaltacker
Kaltbach
Kaltbrunn
Kaltenbach
Kammersrohr
Kandergrund
Kandersteg
Känerkinden
Kappel
Kappel am Albis
Kappelen
Kastanienbaum
Kaufdorf
Kefikon
Kehrsatz
Kehrsiten
Kemmental
Kemptthal
Kernenried
Kerns
Kerzers
Kesswil
Kestenholz
Kienberg
Kiental
Kiesen
Kilchberg
Killwangen
Kippel
Kirchberg
Kirchdorf
Kirchenthurnen
Kirchleerau
Kirchlindach
Klarsreuti
Kleinandelfingen
Kleinbösingen
Kleindietwil
Kleindöttingen
Kleine Scheidegg
Kleingurmels
Kleinlützel
Kleinwangen
Klingnau
Klöntal
Kloster Fahr
Klosters
Klosters Dorf
Kloten
Knonau
Knutwil
Koblenz
Kollbrunn
Kölliken
Köniz
Konolfingen
Koppigen
Kottwil
Kradolf
Kradolf-Schönenberg
Kräiligen
Krattigen
Krauchthal
Kreuzlingen
Kriechenwil
Kriegstetten
Kriens
Kriessern
Krinau
Krummenau
Küblis
Kulmerau
Kümmertshausen
Künten
Küsnacht
Küssnacht
Küssnacht am Rigi
Küttigen
Küttigkofen
Kyburg
Kyburg-Buchegg
L'Abbaye
L'Abergement
L'Auberson
L'Etivaz
L'Isle
L'Orient
La Baroche
La Brévine
La Brillaz
La Châtagne
La Chaux
La Chaux-de-Fonds
La Chaux-des-Breuleux
La Chaux-du-Milieu
La Cibourg
La Comballaz
La Conversion
La Corbaz
La Côte-aux-Fées
La Coudre
La Croix
La Croix-de-Rozon
La Cure
La Ferrière
La Forclaz
La Fouly
La Garde
La Grande Béroche
La Heutte
La Joux
La Lécherette
La Magne
La Neirigue
La Neuveville
La Place
La Plaine
La Praz
La Punt Chamues-ch
La Rippe
La Roche
La Rösa
La Russille
La Sage
La Sagne
La Sarraz
La Sonnaz
La Tanne
La Tine
La Tour
La Tour-de-Peilz
La Tour-de-Trême
La Tzoumaz
La Vernaz
La Verrerie
La Vraconnaz
La Vue-des-Alpes
Laax
Laconnex
Ladir
Lajoux
Lalden
Lamboing
Lamone
Lampenberg
Lamperswil
Lancy
Landiswil
Landquart
Landschlacht
Langenbruck
Längenbühl
Langendorf
Langenthal
Langnau am Albis
Langnau b. Reiden
Langnau im Emmental
Langrickenbach
Langwies
Langwiesen
Lanna
Lanterswil
Lantsch
Lanzenhäusern
Lanzenneunforn
Largario
Laténa
Latsch
Latterbach
Lätti
Lauenen
Lauenen b. Gstaad
Lauerz
Läufelfingen
Laufen-Uhwiesen
Laufenburg
Laupen
Laupersdorf
Lauperswil
Lausanne
Lausen
Lauterbrunnen
Lauwil
Lavertezzo
Lavey-les-Bains
Lavey-Morcles
Lavey-Village
Lavigny
Lavin
Lavizzara
Lavorgo
Le Bémont
Le Brassus
Le Brouillet
Le Bry
Le Cerneux-Péquignot
Le Cerneux-Veusil
Le Châble
Le Château-de-Ste-Croix
Le Châtelard
Le Châtelard-près-Romont
Le Chenit
Le Crêt-du-Locle
Le Crêt-près-Semsales
Le Flon
Le Fuet
Le Grand-Saconnex
Le Landeron
Le Lieu
Le Lignon
Le Locle
Le Mont-Pèlerin
Le Mont-sur-Lausanne
Le Mouret
Le Noirmont
Le Pâquier
Le Pâquier-Montbarry
Le Peuchapatte
Le Pont
Le Prédame
Le Prese
Le Prévoux
Le Séchey
Le Sentier
Le Sépey
Le Solliat
Le Trétien
Le Vaud
Léchelles
Leggia
Leibstadt
Leimbach
Leimiswil
Leissigen
Lema
Lenggenwil
Lengnau
Lengwil
Lenk
Lenk im Simmental
Lens
Lentigny
Lenz
Lenzburg
Lenzerheide
Leontica
Les Acacias
Les Agettes
Les Avanchets
Les Avants
Les Bayards
Les Bioux
Les Bois
Les Brenets
Les Breuleux
Les Charbonnières
Les Clées
Les Collons
Les Crosets
Les Cullayes
Les Diablerets
Les Ecasseys
Les Ecorcheresses
Les Emibois
Les Enfers
Les Evouettes
Les Friques
Les Geneveys-sur-Coffrane
Les Genevez
Les Giettes
Les Granges
Les Haudères
Les Hauts-Geneveys
Les Marécottes
Les Mayens-de-Sion
Les Montets
Les Monts-de-Corsier
Les Monts-de-Pully
Les Mosses
Les Moulins
Les Paccots
Les Planchettes
Les Plans-sur-Bex
Les Pommerats
Les Pontins
Les Ponts-de-Martel
Les Posses-sur-Bex
Les Prés-d'Orvin
Les Rasses
Les Reussilles
Les Sagnettes
Les Sciernes-d'Albeuve
Les Taillères
Les Tavernes
Les Thioleyres
Les Valettes
Les Vérines
Les Verrières
Les Vieux-Prés
Lessoc
Leuggelbach
Leuggern
Leuk
Leuk Stadt
Leukerbad
Leutwil
Leuzigen
Levron
Leysin
Leytron
Li Curt
Libingen
Lichtensteig
Liddes
Liebefeld
Liebistorf
Liedertswil
Lieffrens
Lieli
Lienz
Liesberg
Liesberg Dorf
Liestal
Liez
Ligerz
Lignerolle
Lignières
Ligornetto
Limpach
Lindau
Linden
Linescio
Linthal
Lipperswil
Lippoldswilen
Littenheid
Litzirüti
Lobsigen
Locarno
Loco
Lodano
Lodrino
Lohn-Ammannsegg
Löhningen
Lohnstorf
Lömmenschwil
Lommis
Lommiswil
Lonay
Longirod
Lopagno
Losone
Lossy
Lostallo
Lostorf
Lottigna
Lotzwil
Lourtier
Lovatens
Lovens
Loveresse
Lucelle
Lucens
Lüchingen
Luchsingen
Ludiano
Lüen
Lufingen
Lugaggia
Lugano
Lugnez
Lugnorre
Luins
Lully
Lumbrein
Lumino
Lumnezia
Lunden
Lungern
Lupfig
Lupsingen
Lurtigen
Lüscherz
Lussery-Villars
Lüsslingen
Lüsslingen-Nennigkofen
Lussy
Lussy-sur-Morges
Lustdorf
Lustmühle
Luterbach
Lüterkofen
Lüterkofen-Ichertswil
Lüterswil
Luthern
Luthern Bad
Lütisburg
Lütisburg Station
Lutry
Lütschental
Lützelflüh
Lützelflüh-Goldbach
Lutzenberg
Luven
Luzein
Luzern
Lyss
Lyssach
Macolin
Madetswil
Madiswil
Madonna del Piano
Mädris-Vermol
Madulain
Magadino
Magden
Mägenwil
Maggia
Magglingen
Magliaso
Maglio di Colla
Magnedens
Maienfeld
Mairengo
Maisprach
Maladers
Malans
Malix
Malleray
Maloja
Malters
Malvaglia
Mamishaus
Mammern
Mandach
Männedorf
Mannenbach-Salenstein
Mannens
Manno
Maracon
Marbach
Marchissy
Mariastein
Marin-Epagnier
Marly
Marmorera
Marnand
Maroggia
Marolta
Marsens
Märstetten
Marthalen
Martherenges
Martigny
Martigny-Combe
Martigny-Croix
Martina
Martisberg
Märwil
Maschwanden
Mase
Masein
Maseltrangen
Massagno
Massongex
Massonnens
Mastrils
Mathod
Mathon
Matran
Matten
Matten b. Interlaken
Matten bei Interlaken
Mattstetten
Mattwil
Matzendorf
Matzingen
Mauborget
Mauensee
Maules
Maur
Mauraz
Mauren
Mayens-de-Chamoson
Medeglia
Medel
Medels im Rheinwald
Meggen
Mehlsecken
Meien
Meienberg
Meienried
Meierskappel
Meikirch
Meilen
Meinier
Meinisberg
Meiringen
Meisterschwanden
Melano
Melchnau
Melchsee-Frutt
Melchtal
Melide
Mellikon
Mellingen
Mels
Meltingen
Mendrisio
Ménières
Menzberg
Menzengrüt
Menziken
Menzingen
Menznau
Menzonio
Merenschwand
Mergoscia
Meride
Merishausen
Merligen
Merlischachen
Mervelier
Merzligen
Mesocco
Mettau
Mettauertal
Mettembert
Mettendorf
Mettlen
Mettmenstetten
Metzerlen
Metzerlen-Mariastein
Meyriez
Meyrin
Mézery-près-Donneloye
Mézières
Mezzovico
Mezzovico-Vira
Middes
Miécourt
Miège
Miex
Miglieglia
Milken
Milvignes
Minusio
Miralago
Mirchel
Misériez
Misery
Misery-Courtion
Missy
Mitlödi
Mittelhäusern
Mogelsberg
Moghegno
Möhlin
Moiry
Molare
Moleno
Moléson-sur-Gruyères
Molinis
Mollens
Mollie-Margot
Mollis
Molondin
Mols
Mönchaltorf
Moneto
Monible
Monnaz
Mont-Crosin
Mont-de-Buttes
Mont-la-Ville
Mont-Noble
Mont-Soleil
Mont-sur-Rolle
Mont-Tramelan
Mont-Vully
Montagne-de-Courtelary
Montagne-de-Sonvilier
Montagnola
Montagnon
Montagny
Montagny-la-Ville
Montagny-les-Monts
Montagny-près-Yverdon
Montalchez
Montana
Montanaire
Montaubion-Chardonney
Montavon
Montbovon
Montbrelloz
Montcherand
Monte Carasso
Monteceneri
Monteggio
Montenol
Montet
Montévraz
Montezillon
Montfaucon
Montfavergier
Mönthal
Montherod
Monthey
Montignez
Montilliez
Montlingen
Montmagny
Montmelon
Montmollin
Montpreveyres
Montreux
Montricher
Montsevelier
Moosleerau
Moosseedorf
Morbio Inferiore
Morbio Superiore
Morcles
Morcote
Mörel
Mörel-Filet
Morens
Morgarten
Morges
Morgins
Mörigen
Möriken
Möriken-Wildegg
Morissen
Morlens
Morlon
Morrens
Morschach
Mörschwil
Mosen
Mosnang
Mosogno
Mossel
Môtier
Môtiers
Mötschwil
Moudon
Moutier
Movelier
Mugena
Muggio
Muhen
Mühlau
Mühlebach
Mühleberg
Mühledorf
Mühlehorn
Mühlethal
Mühlethurnen
Mühlrüti
Mülchi
Mulegns
Mülenen
Müllheim
Müllheim Dorf
Müllheim-Wigoltingen
Mülligen
Mümliswil
Mümliswil-Ramiswil
Mumpé Medel
Mumpf
Münchenbuchsee
Münchenstein
Münchenwiler
Münchringen
Münchwilen
Münsingen
Münsterlingen
Muntelier
Muntogna da Schons
Müntschemier
Muolen
Muotathal
Muralto
Muraz
Murg
Murgenthal
Muri
Muri b. Bern
Muri bei Bern
Muriaux
Murist
Mürren
Murten
Murzelen
Müselbach
Müstair
Mustér
Müswangen
Mutrux
Mutten
Muttenz
Muzzano
Näfels
Nänikon
Nassenwil
Naters
Nebikon
Necker
Neckertal
Neerach
Neftenbach
Neggio
Neirivue
Némiaz
Nendaz
Nendeln
Nennigkofen
Nenzlingen
Neschwil
Nesselnbach
Nesslau
Netstal
Neu St. Johann
Neuägeri
Neuchâtel
Neudorf
Neuendorf
Neuenegg
Neuenhof
Neuenkirch
Neuhaus
Neuhausen am Rheinfall
Neuheim
Neukirch
Neukirch an der Thur
Neunforn
Neunkirch
Neuwilen
Neyruz
Neyruz-sur-Moudon
Nidau
Nidfurn
Niederbipp
Niederbuchsiten
Niederbüren
Niederdorf
Niedergampel
Niedergesteln
Niederglatt
Niedergösgen
Niederhasli
Niederhelfenschwil
Niederhünigen
Niederlenz
Niedermuhlern
Niederneunforn
Niederönz
Niederösch
Niederrickenbach
Niederried b. Interlaken
Niederried b. Kallnach
Niederried bei Interlaken
Niederrohrdorf
Niederscherli
Niederstetten
Niederstocken
Niederteufen
Niederurnen
Niederuzwil
Niederwald
Niederwangen b. Bern
Niederweningen
Niederwil
Nierlet-les-Bois
Niouc
Niva
Nivo
Noble-Contrée
Nods
Noës
Noflen
Nohl
Noiraigue
Noréaz
Nottwil
Novaggio
Novalles
Novazzano
Noville
Nufenen
Nuglar
Nuglar-St. Pantaleon
Nunningen
Nürensdorf
Nussbaumen
Nusshof
Nuvilly
Nyon
Obbürgen
Oberaach
Oberägeri
Oberarth
Oberbalm
Oberbalmberg
Oberbipp
Oberbuchsiten
Oberbüren
Oberburg
Oberbussnang
Oberbütschel
Oberdiessbach
Oberdorf
Oberegg
Oberembrach
Oberems
Oberengstringen
Oberentfelden
Oberflachs
Oberfrittenbach
Obergerlafingen
Obergesteln
Oberglatt
Obergoldbach
Obergoms
Obergösgen
Oberhallau
Oberhasli
Oberhelfenschwil
Oberhof
Oberhofen
Oberhofen am Thunersee
Oberhünigen
Oberiberg
Oberkirch
Oberkulm
Oberlangenegg
Oberlunkhofen
Obermumpf
Obermutten
Obernau
Oberneunforn
Oberohringen
Oberönz
Oberösch
Oberramsern
Oberrickenbach
Oberried
Oberried am Brienzersee
Oberrieden
Oberriet
Oberrindal
Oberrohrdorf
Oberrüti
Obersaxen
Obersaxen Mundaun
Oberschan
Oberschrot
Obersiggenthal
Oberstammheim
Obersteckholz
Oberstetten
Oberstocken
Oberterzen
Oberthal
Oberurnen
Oberuzwil
Obervaz
Oberwald
Oberwangen
Oberwangen b. Bern
Oberweningen
Oberwil
Oberwil b. Büren
Oberwil b. Zug
Oberwil bei Büren
Oberwil im Simmental
Oberwil-Lieli
Obfelden
Obstalden
Ochlenberg
Ocourt
Odogno
Oekingen
Oensingen
Oerlingen
Oeschenbach
Oeschgen
Oeschseite
Oetwil am See
Oetwil an der Limmat
Oftringen
Ogens
Oggio
Ohmstal
Oleyres
Olivone
Ollon
Olsberg
Olten
Oltingen
Onex
Onnens
Onsernone
Opfershofen
Opfertshofen
Opfikon
Oppens
Oppikon
Oppligen
Orbe
Orges
Origlio
Ormalingen
Ormont-Dessous
Ormont-Dessus
Orny
Oron
Oron-la-Ville
Oron-le-Châtel
Orpund
Orselina
Orsières
Orsonnens
Ortschwaben
Orvin
Orzens
Oschwand
Osco
Osogna
Ospizio Bernina
Ossingen
Osterfingen
Ostermundigen
Otelfingen
Othmarsingen
Ottenbach
Ottikon
Ottikon b. Kemptthal
Ottoberg
Oulens-sous-Echallens
Oulens-sur-Lucens
Ovronnaz
Pagig
Pailly
Palagnedra
Palasuit
Palézieux
Palézieux-Village
Pambio-Noranco
Pampigny
Panex
Pany
Paradiso
Parpan
Parsonz
Paspels
Passugg
Paudex
Payerne
Pazzallo
Peccia
Pedrinate
Peiden
Peist
Peney-le-Jorat
Pensier
Penthalaz
Penthaz
Penthéréaz
Perly
Perly-Certoux
Perrefitte
Perroy
Personico
Péry
Péry-La Heutte
Peseux
Petit Vichères
Petit-Lancy
Petit-Martel
Petit-Val
Peyres-Possens
Pfäfers
Pfaffhausen
Pfäffikon
Pfaffnau
Pfeffikon
Pfeffingen
Pfungen
Pfyn
Piandera Paese
Pianezzo
Piano di Peccia
Piazzogna
Pierrafortscha
Pieterlen
Pignia
Pigniu
Pilatus Kulm
Piotta
Pitasch
Pizy
Plaffeien
Plagne
Plan-les-Ouates
Planken
Plasselb
Plateau de Diesse
Platta
Plaun da Lej
Pleigne
Pleujouse
Plons
Pohlern
Poliez-le-Grand
Poliez-Pittet
Pollegio
Pompaples
Pomy
Pont-de-la-Morge
Pont-en-Ogoz
Pont-la-Ville
Ponte Capriasca
Ponte Tresa
Pontenet
Ponthaux
Ponto Valentino
Pontresina
Porrentruy
Porsel
Port-Valais
Portalban
Portein
Porto Ronco
Porza
Posat
Poschiavo
Posieux
Praden
Pragg-Jenaz
Prahins
Prangins
Praratoud
Prato
Prato-Sornico
Pratteln
Pratval
Pravidondaz
Praz
Präz
Praz-de-Fort
Preda
Pregassona
Pregny-Chambésy
Prêles
Preonzo
Presinge
Préverenges
Prévondavaux
Prévonloup
Prez
Prez-vers-Noréaz
Prez-vers-Siviriez
Prilly
Pringy
Progens
Promasens
Promontogno
Prosito
Prugiasco
Pugerna
Puidoux
Pully
Puplinge
Pura
Purasca
Pusserein
Quarten
Quartino
Quinten
Quinto
Rabius
Radelfingen
Radelfingen b. Aarberg
Rafz
Rain
Ramersberg
Rämismühle
Ramiswil
Ramlinsburg
Ramosch
Ramsei
Ramsen
Rancate
Rances
Randa
Randogne
Ranflüh
Ranzo
Raperswilen
Rapperswil
Rapperswil-Jona
Raron
Rasa
Ravoire
Realp
Rebeuvelier
Rebévelier
Rebstein
Recherswil
Rechthalten
Réchy
Reckingen
Réclère
Reconvilier
Regensberg
Regensdorf
Rehetobel
Reichenbach im Kandertal
Reichenburg
Reiden
Reidermoos
Reigoldswil
Reinach
Reisiswil
Reitnau
Rekingen
Remaufens
Remetschwil
Remigen
Renan
Renens
Rengg
Rennaz
Retschwil
Reute
Reutigen
Reutlingen
Reverolle
Rhäzüns
Rheinau
Rheineck
Rheinfelden
Rheinklingen
Rheinsulz
Rheinwald
Riaz
Riazzino
Richenthal
Richigen
Richterswil
Ricken
Rickenbach
Rickenbach b. Schwyz
Rickenbach b. Wil
Rickenbach Sulz
Ricketwil
Riddes
Ried
Ried b. Kerzers
Ried bei Kerzers
Ried-Brig
Ried-Mörel
Rieden
Riederalp
Riedern
Riedholz
Riedikon
Riedstätt
Riedt b. Erlen
Riedtwil
Riehen
Riein
Riemenstalden
Riet
Rietheim
Riex
Riffenmatt
Rifferswil
Riggisberg
Rigi Kaltbad
Rigi Klösterli
Rigi Kulm
Rigi Scheidegg
Rigi Staffel
Riken
Rikon im Tösstal
Ringgenberg
Ringoldswil
Riniken
Riom
Risch
Ritzingen
Riva San Vitale
Rivaz
Rive Haute
Riveo
Rivera
Riviera
Rizenbach
Robasacco
Roche-d'Or
Rochefort
Rocourt
Rodels
Rodersdorf
Rodi-Fiesso
Roggenburg
Roggliswil
Roggwil
Rohr b. Olten
Rohrbach
Rohrbachgraben
Rohrmatt
Romainmôtier
Romainmôtier-Envy
Romairon
Romanel-sur-Lausanne
Romanel-sur-Morges
Romanens
Romanshorn
Rombach
Römerswil
Romont
Romoos
Rona
Ronco sopra Ascona
Rongellen
Root D4
Ropraz
Rorbas
Rorschach
Rorschacherberg
Röschenz
Rosenlaui
Rossa
Rossemaison
Rossenges
Rossens
Rosshäusern
Rossinière
Rossrüti
Rossura
Rosswald
Röthenbach Herzogenbuchsee
Röthenbach im Emmental
Rothenbrunnen
Rothenburg
Rothenfluh
Rothenhausen
Rothenthurm
Rothrist
Rothwald
Rotkreuz
Rottenschwil
Rougemont
Roveredo
Rovio
Rovray
Rubigen
Rüderswil
Rüdlingen
Rudolfingen
Rudolfstetten
Rudolfstetten-Friedlisberg
Rüdtligen
Rüdtligen-Alchenflüh
Rüedisbach
Rüeggisberg
Rüegsau
Rüegsauschachen
Rüegsbach
Rueras
Rüeterswil
Rueun
Rueyres
Rueyres-les-Prés
Rueyres-St-Laurent
Rueyres-Treyfayes
Rüfenach
Rüfenacht
Rufi
Ruggell
Rumendingen
Rümikon
Rumisberg
Rümlang
Rümligen
Rumlikon
Rümlingen
Rünenberg
Rupperswil
Ruppoldsried
Rüschegg
Rüschegg Gambach
Rüschegg Heubach
Ruschein
Rüschlikon
Russikon
Russin
Russy
Ruswil
Rüthi
Rüti
Rüti b. Büren
Rüti b. Lyssach
Rüti b. Riggisberg
Rüti bei Büren
Rüti bei Lyssach
Rütihof
Rütli
Rütschelen
Rutschwil
Rüttenen
Ruvigliana
S-chanf
S. Antonino
S. Antonio
S. Benedetg
S. Bernardino
S. Carlo
S. Nazzaro
S. Pietro
S. Vittore
Saanen
Saanenmöser
Saas im Prättigau
Saas-Almagell
Saas-Balen
Saas-Fee
Saas-Grund
Sachseln
Saclentse
Safenwil
Safien Platz
Safiental
Safnern
Sagno
Sagogn
Saicourt
Saignelégier
Saillon
Saint-Aubin
Saint-Barthélemy
Saint-Brais
Saint-Cergue
Saint-George
Saint-Gingolph
Saint-Imier
Saint-Léonard
Saint-Livres
Saint-Martin
Saint-Maurice
Saint-Oyens
Saint-Prex
Saint-Saphorin
Saint-Sulpice
Sainte-Croix
Sala Capriasca
Saland
Salavaux
Salenstein
Sâles
Salez
Salgesch
Salins
Salmsach
Salorino
Salouf
Salvan
Salvenach
Samedan
Samnaun
Samnaun Dorf
Samnaun-Compatsch
Samstagern
San Vittore
Sangernboden
Sant'Antonino
Santa Maria in Calanca
Sargans
Säriswil
Sarmenstorf
Sarn
Sarnen
Sarreyer
Sarzens
Sassel
Satigny
Saubraz
Sauge
Saulcy
Saules
Savagnier
Savièse
Savigny
Savognin
Savosa
Saxeten
Saxon
Saxonne
Scareglia
Schaan
Schaanwald
Schachen
Schachen b. Herisau
Schachen b. Reute
Schaffhausen
Schafhausen im Emmental
Schafisheim
Schalchen
Schalunen
Schangnau
Schänis
Scharans
Scharnachtal
Schattdorf
Schattenhalb
Scheid
Schellenberg
Schelten
Schenkon
Scherz
Scherzingen
Scheunen
Scheuren
Schiers
Schindellegi
Schinznach
Schinznach Bad
Schinznach Dorf
Schlans
Schlarigna
Schlatt
Schlatt-Haslen
Schlattingen
Schleinikon
Schleitheim
Schlierbach
Schlieren
Schliern b. Köniz
Schlossrued
Schlosswil
Schluein
Schmerikon
Schmidigen-Mühleweg
Schmidrüti
Schmidshof
Schmiedrued
Schmitten
Schnaus
Schneisingen
Schnottwil
Schocherswil
Schöfflisdorf
Schöftland
Schönenbaumgarten
Schönenberg
Schönenberg an der Thur
Schönenbuch
Schönengrund
Schönenwerd
Schongau
Schönholzerswilen
Schönried
Schötz
Schübelbach
Schuders
Schüpbach
Schupfart
Schüpfen
Schüpfheim
Schwaderloch
Schwadernau
Schwanden
Schwanden b. Brienz
Schwanden bei Brienz
Schwanden im Emmental
Schwändi b. Schwanden
Schwarzenbach
Schwarzenberg
Schwarzenburg
Schwarzenegg
Schwarzhäusern
Schwarzsee
Schweizersholz
Schwellbrunn
Schwende
Schwende-Rüte
Schwenden im Diemtigtal
Schwendi im Weisstannental
Schwendibach
Schwerzenbach
Schwyz
Scuol
Sédeilles
Sedrun
Seeberg
Seedorf
Seegräben
Seehof
Seelisberg
Seengen
Seewen
Seewil
Seewis Dorf
Seewis im Prättigau
Seewis-Pardisla
Seewis-Schmitten
Seftigen
Segl
Segl Baselgia
Segl Maria
Segnas
Seigneux
Seiry
Seleute
Selkingen
Selma
Seltisberg
Selzach
Sembrancher
Sementina
Semione
Sempach
Sempach Station
Semsales
Senarclens
Senèdes
Sennhof
Sennwald
Seon
Sergey
Serneus
Serpiano
Serravalle
Servion
Seseglio
Sessa
Seuzach
Sévaz
Sevelen
Sévery
Sevgein
Sfazù
Siat
Siblingen
Siebnen
Siegershausen
Sierre
Siggenthal Station
Sigigen
Sigirino
Siglistorf
Signau
Signèse
Signôra
Signy
Signy-Avenex
Sigriswil
Sihlbrugg
Sihlbrugg Station
Sihlwald
Silenen
Sils
Sils im Domleschg
Sils im Engadin
Silvaplana
Silvaplana-Surlej
Simplon
Simplon Dorf
Simplon Hospiz
Sins
Sion
Sirnach
Siselen
Sisikon
Sissach
Sisseln
Sitterdorf
Siviez
Siviriez
Soazza
Sobrio
Soglio
Solduno
Solothurn
Someo
Sommentier
Sommeri
Sonceboz-Sombeval
Sonnental
Sonogno
Sonterswil
Sonvico
Sonvilier
Sool
Soral
Sörenberg
Sorengo
Sorens
Sornard
Sornetan
Sorvilier
Sottens
Soubey
Souboz
Soulce
Soyhières
Speicherschwendi
Spiegel b. Bern
Spiez
Spiringen
Splügen
Spreitenbach
Spruga
St-Aubin
St-Aubin-Sauges
St-Barthélemy
St-Blaise
St-Brais
St-Cergue
St-Cierges
St-George
St-Gingolph
St-Imier
St-Jean
St-Légier-La Chiésaz
St-Léonard
St-Livres
St-Luc
St-Martin
St-Maurice
St-Oyens
St-Pierre-de-Clages
St-Prex
St-Romain
St-Saphorin
St-Saphorin-sur-Morges
St-Séverin
St-Sulpice
St-Triphon
St-Ursanne
St. Antoni
St. Antönien
St. Erhard
St. Gallen
St. Gallenkappel
St. German
St. Josefen
St. Margarethen
St. Margrethen
St. Margrethenberg
St. Martin
St. Moritz
St. Niklaus
St. Niklausen
St. Pantaleon
St. Pelagiberg
St. Peter
St. Peterzell
St. Silvester
St. Stephan
St. Urban
St. Ursen
Sta. Domenica
Sta. Maria in Calanca
Sta. Maria Val Müstair
Staad
Staatswald Galm
Stabio
Stachen
Stadel
Stadel b. Niederglatt
Stäfa
Staffelbach
Stalden
Staldenried
Stallikon
Stammheim
Stampa
Stans
Stansstad
Starrkirch-Wil
Staufen
Ste-Croix
Stechelberg
Steckborn
Steffisburg
Steg
Steg im Tösstal
Steg-Hohtenn
Stehrenberg
Stein am Rhein
Steinach
Steinebrunn
Steinerberg
Steinhaus
Steinhausen
Steinhof
Steinhuserberg
Steinmaur
Stels
Sternenberg
Stetten
Stettfurt
Stettlen
Stierva
Stilli
Stocken-Höfen
Stoos
Strada
Strengelbach
Studen
Stugl
Stuls
Stüsslingen
Suberg
Subingen
Suchy
Süderen
Suen
Sufers
Sugiez
Sugnens
Suhr
Sulgen
Sullens
Sulz
Sulzbach
Sumiswald
Summaprada
Sumvitg
Sundlauenen
Sünikon
Surava
Surcasti
Surcuolm
Surpierre
Surrein
Sursee
Surses
Suscévaz
Susch
Susten
Sutz
Sutz-Lattrigen
Syens
Tafers
Tagelswangen
Tägerig
Tägerschen
Tägertschi
Tägerwilen
Tamins
Tann
Tannay
Tarasp
Tartegnin
Täsch
Tatroz
Täuffelen
Tavanasa
Tavannes
Tecknau
Tegerfelden
Tegna
Tenero
Tenero-Contra
Tenna
Tenniken
Tennwil
Tentlingen
Termen
Terre di Pedemonte
Territet
Tersnaus
Tesserete
Teufen
Teufenthal
Teuffenthal
Teuffenthal b. Thun
Tévenon
Thal
Thalheim
Thalheim an der Thur
Thalkirch
Thalwil
Thayngen
Theilingen
Therwil
Thielle
Thierachern
Thierrens
Thônex
Thörigen
Thörishaus
Thun
Thundorf
Thunstetten
Thurnen
Thürnen
Thusis
Thyon
Tiefencastel
Tinizong
Titterten
Tobel
Tobel-Tägerschen
Toffen
Tolochenaz
Tomils
Törbel
Torgon
Torny
Torny-le-Grand
Torre
Torricella
Torricella-Taverne
Trachselwald
Trachslau
Tramelan
Trasadingen
Treiten
Trélex
Tremona
Tresa
Trey
Treycovagnes
Treytorrens
Treyvaux
Triboltingen
Triengen
Trient
Triesen
Triesenberg
Trimbach
Trimmis
Trimstein
Trin
Trin Mulin
Trogen
Trogne
Troinex
Troistorrents
Trub
Trübbach
Trubschachen
Trüllikon
Trun
Truttikon
Tschappina
Tscheppach
Tscherlach
Tschiertschen
Tschierv
Tschingel ob Gunten
Tschlin
Tschugg
Tübach
Tuggen
Tujetsch
Tumegl
Turbach
Turbenthal
Turgi
Turin
Turtmann
Turtmann-Unterems
Tüscherz-Alfermée
Tuttwil
Twann
Twann-Tüscherz
Udligenswil
Ueberstorf
Uebeschi
Ueken
Uerikon
Uerkheim
Uerschhausen
Uerzlikon
Uesslingen
Uesslingen-Buch
Uetendorf
Uetikon am See
Uetliberg
Uetliburg
Uettligen
Uezwil
Uffikon
Ufhusen
Uhwiesen
Uitikon
Uitikon Waldegg
Ulisbach
Ulmiz
Ulrichen
Umiken
Undervelier
Unterägeri
Unterbach
Unterbäch
Untereggen
Unterems
Unterendingen
Unterengstringen
Unterentfelden
Unteriberg
Unterkulm
Unterlangenegg
Unterlunkhofen
Unterohringen
Unterramsern
Unterrindal
Unterschächen
Unterseen
Untersiggenthal
Unterstammheim
Untersteckholz
Unterterzen
Untervaz
Unterwasser
Uors
Urdorf
Urmein
Urnäsch
Urnerboden
Ursenbach
Ursins
Urswil
Ursy
Urtenen-Schönbühl
Uster
Uttigen
Uttwil
Utzenstorf
Utzigen
Uvrier
Uznach
Uzwil
Vacallo
Vadura
Vaduz
Vaglio
Vairano
Val de Bagnes
Val Mara
Val Müstair
Val Terbi
Val-d'Illiez
Val-de-Charmey
Val-de-Ruz
Val-de-Travers
Valangin
Valbella
Valbirse
Valbroye
Valchava
Valendas
Valens
Valeyres-sous-Montagny
Valeyres-sous-Rances
Valeyres-sous-Ursins
Vallamand
Vallorbe
Vals
Valsot
Valzeina
Vandoeuvres
Varen
Vasön
Vättis
Vattiz
Vauderens
Vauffelin
Vaugondry
Vaulion
Vaulruz
Vaumarcus
Vaux-sur-Morges
Vechigen
Vella
Vellerat
Veltheim
Vendlincourt
Vens
Venthône
Verbier
Vercorin
Verdabbio
Verdasio
Vergeletto
Vermes
Vernamiège
Vernate
Vernayaz
Vernier
Vérossaz
Vers-chez-Perrin
Vers-l'Eglise
Versam
Verscio
Versegères
Versoix
Verzasca
Vésenaz
Vesin
Vessy
Vétroz
Veulden
Vevey
Veyras
Veyrier
Veysonnaz
Veytaux
Vezia
Vezio
Viano
Vich
Vichères
Vico Morcote
Vicosoprano
Vicques
Vielbringen b. Worb
Viganello
Vignogn
Vilars
Villa Bedretto
Villa Luganese
Villaraboud
Villarbeney
Villard-sur-Chamby
Villarepos
Villargiroud
Villariaz
Villarimboud
Villarlod
Villars-Bozon
Villars-Bramard
Villars-Burquin
Villars-Epeney
Villars-le-Comte
Villars-le-Grand
Villars-le-Terroir
Villars-Mendraz
Villars-Sainte-Croix
Villars-sous-Champvent
Villars-sous-Mont
Villars-sous-Yens
Villars-Ste-Croix
Villars-sur-Fontenais
Villars-sur-Glâne
Villars-sur-Ollon
Villars-Tiercelin
Villarsel-le-Gibloux
Villarsel-sur-Marly
Villarsiviriaux
Villarvolard
Villarzel
Villaz
Villaz-St-Pierre
Villeneuve
Villeret
Villette
Villiers
Villigen
Villmergen
Villnachern
Villorsonnens
Vilters
Vilters-Wangs
Vinelz
Vinzel
Vionnaz
Vira
Visp
Visperterminen
Vissoie
Vitznau
Vogelsang
Vogorno
Volken
Volketswil
Vollèges
Vordemwald
Vorderthal
Vouvry
Vrin
Vuadens
Vuarmarens
Vuarrens
Vucherens
Vufflens-la-Ville
Vufflens-le-Château
Vugelles-La Mothe
Vuibroye
Vuippens
Vuissens
Vuisternens-devant-Romont
Vuisternens-en-Ogoz
Vuiteboeuf
Vulliens
Vullierens
Vully-les-Lacs
Vulpera
Vuorz
Wabern
Wachseldorn
Wädenswil
Wagenhausen
Wagerswil
Wahlen b. Laufen
Wahlendorf
Walchwil
Walde
Waldenburg
Waldhäusern
Wäldi
Waldkirch
Waldstatt
Walenstadt
Walenstadtberg
Walkringen
Wallbach
Wallenbuch
Wallenried
Wallenwil
Wallisellen
Walliswil b. Niederbipp
Walliswil b. Wangen
Walliswil bei Niederbipp
Walliswil bei Wangen
Walperswil
Waltalingen
Waltensburg
Waltenschwil
Walterswil
Walzenhausen
Wangen
Wangen an der Aare
Wangen b. Dübendorf
Wangen b. Olten
Wangen bei Olten
Wangen-Brüttisellen
Wangenried
Wängi
Wangs
Wanzwil
Wartau
Warth
Warth-Weiningen
Wasen im Emmental
Wassen
Wasserauen
Wasterkingen
Wattenwil
Wattwil
Wauwil
Wavre
Weesen
Wegenstetten
Weggis
Weiach
Weier im Emmental
Weinfelden
Weingarten-Kalthäusern
Weiningen
Weissbad
Weissenburg
Weissenstein b. Solothurn
Weisslingen
Weisstannen
Welschenrohr
Welschenrohr-Gänsbrunnen
Wengen
Wengi
Wengi b. Büren
Wengi b. Frutigen
Wenslingen
Werdenberg
Wergenstein
Wermatswil
Wernetshausen
Werthenstein
Wettingen
Wettswil
Wettswil am Albis
Wetzikon
Wichtrach
Widen
Widnau
Wiedlisbach
Wienacht-Tobel
Wiesenberg
Wiesendangen
Wiezikon b. Sirnach
Wiggen
Wiggiswil
Wigoltingen
Wikon
Wila
Wilchingen
Wildberg
Wildegg
Wildensbuch
Wilderswil
Wildhaus
Wildhaus-Alt St. Johann
Wilen
Wilen b. Neunforn
Wilen b. Wil
Wilen b. Wollerau
Wiler
Wiler b. Seedorf
Wiler b. Utzenstorf
Wiler bei Utzenstorf
Wileroltigen
Wiliberg
Wilihof
Willadingen
Willerzell
Willisau
Willisdorf
Wimmis
Winden
Windisch
Windlach
Winikon
Winistorf
Winterberg
Wintersingen
Winterthur
Winznau
Wirzweli
Wisen
Wislikofen
Wittenbach
Wittenwil
Witterswil
Wittinsburg
Wittnau
Wittwil
Wohlen
Wohlen b. Bern
Wohlen bei Bern
Wohlenschwil
Wolfenschiessen
Wolfertswil
Wolfhalden
Wolfhausen
Wolfisberg
Wölflinswil
Wolfwil
Wolhusen
Wollerau
Worb
Worben
Worblaufen
Wöschnau
Wünnewil
Wünnewil-Flamatt
Wuppenau
Würenlingen
Würenlos
Wynau
Wynigen
Wyssachen
Yens
Yverdon-les-Bains
Yvonand
Yvorne
Zauggenried
Zäziwil
Zeglingen
Zeihen
Zeiningen
Zell
Zénauva
Zeneggen
Zermatt
Zernez
Zetzwil
Zezikon
Ziefen
Ziegelbrücke
Zielebach
Zignau
Zihlschlacht
Zihlschlacht-Sitterdorf
Zillis
Zillis-Reischen
Zimmerwald
Zinal
Zizers
Zofingen
Zollbrück
Zollikerberg
Zollikofen
Zollikon
Zuben
Züberwangen
Zuchwil
Zuckenriet
Zufikon
Zugerberg
Zullwil
Zumholz
Zumikon
Zunzgen
Zuoz
Zürich
Zurzach
Zuzgen
Zuzwil
Zweidlen
Zweilütschinen
Zweisimmen
Zwieselberg
Zwillikon
Zwischbergen
Zwischenflüh
`.trim().split('\n');
