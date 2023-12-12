// API klíč pro WeatherAPI, aby nám dovolil získávat informace o počasí ze stránky weatherapi.com
const apiKey = '9259724aa7d84549936204644232611';

// Když se stránka úplně načte, spustí se tato funkce
document.addEventListener('DOMContentLoaded', function () { //kód se spustí až poté, co je stránka načtena, až poté se načítají oblíbená města apod
    AktualizaceOblibenaMesta(); // Aktualizuje oblíbená města na stránce
});

// Když někdo odešle formulář s městem, tato funkce se spustí
document.getElementById('NacistZeVstupu').addEventListener('submit', function (e) {
    e.preventDefault(); 

    // Získá jméno města z formuláře
    const NazevMesta = document.getElementById('NazevMesta');
    const JmenoMesta = NazevMesta.value; //používá se při práci s API

    // Zavoláme WeatherAPI, abychom získali aktuální počasí pro toto město
    fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(JmenoMesta)}`)
        .then(response => response.json())
        .then(data => {
            // Zpracujeme odpověď a zobrazíme informace o počasí
            const DataPocasi = { //uložíme data o počasí do proměnné DataPocasi
                teplota: `${data.current.temp_c}°C`,
                podminky: data.current.condition.text,
                misto: data.location.name,
            };
            ZobrazInfoPocasi(DataPocasi); // Funkce, která zobrazí informace na stránce z proměnné DataPocasi
        })
        .catch(error => {
            console.error('Chyba při volání API:', error); // Pokud se něco pokazí, zobrazí chybovou zprávu
        });
});

// Když někdo klikne na tlačítko "Přidat do oblíbených", tato funkce se spustí
document.getElementById('PridatDoOblibenych').addEventListener('click', function () {
    // Získá informace o počasí ze zobrazeného bloku
    const infoOPocasiDiv = document.getElementById('InfoPocasi');
    const JmenoMesta = infoOPocasiDiv.querySelector('h2').textContent;
    const podminky = infoOPocasiDiv.querySelector('p').textContent;

    // Přidá město do oblíbených
    PridatDoOblibenych(JmenoMesta, podminky);
});

// Když někdo klikne na oblíbené město, tato funkce se spustí
document.getElementById('OblibeneMesto').addEventListener('click', function (e) {
    if (e.target.classList.contains('OblibeneMestoTlacitko')) {
        // Pokud je kliknuto na tlačítko oblíbeného města, načti počasí pro toto město
        const JmenoMesta = e.target.textContent;
        NacistPocasi_OblibeneMesto(JmenoMesta);
    }
});

// Funkce pro načítání počasí oblíbeného města
function NacistPocasi_OblibeneMesto(JmenoMesta) {
    // Zavoláme WeatherAPI, abychom získali aktuální počasí pro oblíbené město
    fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(JmenoMesta)}`)
        .then(response => response.json())
        .then(data => {
            // Zpracujeme odpověď a zobrazíme informace o počasí
            const DataPocasi = {
                teplota: `${data.current.temp_c}°C`,
                podminky: data.current.condition.text,
                misto: data.location.name,
            };
            ZobrazInfoPocasi(DataPocasi); // Funkce, která zobrazí informace na stránce
        })
        .catch(error => {
            console.error('Chyba při volání API:', error); // Pokud se něco pokazí, zobrazí chybovou zprávu
        });
}

// Funkce pro zobrazení informací o počasí na stránce
function ZobrazInfoPocasi(data) {
    const infoOPocasiDiv = document.getElementById('InfoPocasi');

    // Zobrazení informací o počasí na stránce
    infoOPocasiDiv.innerHTML = `
        <h2>${data.misto}</h2>
        <p>Podmínky: ${data.podminky}</p>
        <p>Teplota: ${data.teplota}</p>
    `;
}

// Globální pole, které uchovává jména oblíbených měst, aby každé město bylo uloženo jen jednou
const OblibenaMestaSeznam = [];

// Funkce pro přidání města do oblíbených
function PridatDoOblibenych(JmenoMesta) {
    const OblibeneMestoDiv = document.getElementById('OblibeneMesto');

    // Pokud je město již v oblíbených, zobrazí upozornění a dál nepokračuje
    if (OblibenaMestaSeznam.includes(JmenoMesta)) {
        alert(`Obec ${JmenoMesta} už je přidána mezi oblíbené!`);
        return;
    }

    // Pokud je limit oblíbených měst dosažen, odeber první město
    if (OblibenaMestaSeznam.length >= 5) {
        const OdstranMesto = OblibenaMestaSeznam[0];

        // Odstranění prvního města z Local Storage
        OdstranZ_LocalStorage(OdstranMesto);
    }

    // Přidání do oblíbených jako tlačítko s křížkem
    const TlacitkoPridatDoOblibenych = TlacitkoOblibeneMesto(JmenoMesta, OblibeneMestoDiv);
    OblibeneMestoDiv.appendChild(TlacitkoPridatDoOblibenych);

    // Uložení do unikátního pole a Local Storage
    OblibenaMestaSeznam.push(JmenoMesta);
    UlozOblibeneMesto(JmenoMesta);

    // Aktualizace rozhraní
    AktualizujOblibeneMesto();
}

// Funkce pro načítání uložených měst z Local Storage při načtení stránky
function NacistSeznamZ_LocalStorage() {
    const UlozenaMesta = ZiskatMestaZ_LocalStorage();
    OblibenaMestaSeznam.push(...UlozenaMesta);
}

// Volání funkce pro načítání uložených měst z Local Storage
NacistSeznamZ_LocalStorage();

// Funkce pro odstranění města z Local Storage
function OdstranZ_LocalStorage(JmenoMesta) {
    const UlozenaMesta = ZiskatMestaZ_LocalStorage();
    const AktualizovanaMesta = UlozenaMesta.filter(city => city !== JmenoMesta);
    //Vytvoří nové pole které obsahuje města z UlozenaMesta krom města která se má odstranit


    // Uložení aktualizovaného seznamu do Local Storage. Převod pole na JSON řetězec
    localStorage.setItem('OblibeneMesto', JSON.stringify(AktualizovanaMesta));

    // Odstranění města z unikátního pole
    const MestoID = OblibenaMestaSeznam.indexOf(JmenoMesta); //Hledá město v Oblíbených městech
    if (MestoID !== -1) {
        OblibenaMestaSeznam.splice(MestoID, 1);
    }

    // Okamžitá aktualizace rozhraní po odebrání města, slouží k tomu, že můžeme město ihned přidat zpět, jinak se musela znovu načíst stránka
    AktualizaceOblibenaMesta();
}

// Funkce pro vytvoření tlačítka pro oblíbené město s možností odstranění
function TlacitkoOblibeneMesto(JmenoMesta, OblibeneMestoDiv) {
    const TlacitkoPridatDoOblibenych = document.createElement('button'); //Vytvoření tlačítka pro přidání města do oblíbených
    TlacitkoPridatDoOblibenych.classList.add('OblibeneMestoTlacitko'); //CSS vzhled
    TlacitkoPridatDoOblibenych.textContent = JmenoMesta; //Aby v oblíbených bylo jméno města

    // Přidání křížku mimo tlačítko
    const crossIcon = document.createElement('span');
    crossIcon.innerHTML = '&times;'; // Přidání křížku (×)
    crossIcon.classList.add('cross-icon');
    crossIcon.addEventListener('click', function (event) { //Pokud se klikne na křížek, proveď následující...
        OdstranZ_LocalStorage(JmenoMesta); //Odstraní město z oblíbených
        OblibeneMestoDiv.removeChild(TlacitkoPridatDoOblibenych); //Odstraní tlačíko s městem
        AktualizaceOblibenaMesta(); //Zaktualizuje seznam oblíbených měst
    });

    // Přidání křížku k tlačítku
    TlacitkoPridatDoOblibenych.appendChild(crossIcon);

    return TlacitkoPridatDoOblibenych;
}

// Funkce pro uložení oblíbeného města do Local Storage
function UlozOblibeneMesto(JmenoMesta) {
    // Získání oblíbených měst z Local Storage
    const UlozenaMesta = ZiskatMestaZ_LocalStorage();

    // Přidání nového města
    UlozenaMesta.push(JmenoMesta);

    // Uložení aktualizovaného seznamu do Local Storage
    localStorage.setItem('OblibeneMesto', JSON.stringify(UlozenaMesta));
}

// Funkce pro získání oblíbených měst z Local Storage
function ZiskatMestaZ_LocalStorage() {
    // Získání oblíbených měst z Local Storage
    const UlozenaMestaJSON = localStorage.getItem('OblibeneMesto');

    // Převedení JSON na pole
    return UlozenaMestaJSON ? JSON.parse(UlozenaMestaJSON) : [];
}

// Funkce pro aktualizaci rozhraní oblíbených měst
function AktualizaceOblibenaMesta() {
    const OblibeneMestoDiv = document.getElementById('OblibeneMesto');
    OblibeneMestoDiv.innerHTML = ''; // Vyčistíme aktuální obsah

    // Načteme aktuální oblíbená města a zobrazíme je
    const UlozenaMesta = ZiskatMestaZ_LocalStorage();
    UlozenaMesta.slice(-5).forEach(JmenoMesta => {
        const TlacitkoPridatDoOblibenych = TlacitkoOblibeneMesto(JmenoMesta, OblibeneMestoDiv);
        OblibeneMestoDiv.appendChild(TlacitkoPridatDoOblibenych);
    });
}
