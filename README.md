# kayttoliittymat

##Ajo-ohjeet

1. Asenna node.js

### BE

1.1 mene komentorivillä BE-kansion sisään. 

1.2 suorita komento `npm install`

2. Serveri käynnistyy komennolla `node server.js`



### FE

1.1 mene komentorivillä FE-kansion sisään

1.2 suorita komenta `npm install`

*HUOM* front-endin tyylittelyssä käytetään `SCSS` eikä `CSS`. Muutokset tyyleihin tehdään siis `assets` kansion `styles.scss` tiedostoon.
`SCSS` on mukavampi käyttää, sillä se mahdollistaa muuttujien käytön esimerkiksi värien määrittelyssä. Lisäksi tyylejä voidaan sisentää

ESIM.
SCSS:
```
body{

    div{
 
    }
}
```
vertaa CSS:
```
body {

}
body div {

}
```

3. suorita komento `gulp` , joka seuraa muutoksia `styles.scss` tiedostossa ja muuntaa `styles.scss` tiedoston `styles.css` tiedostoksi `dest` kansioon sekä päivittää selaimen automaattisesti kun tiedosto muuttuu.
