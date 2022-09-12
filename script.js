//url = 'https://fcc-weather-api.glitch.me/api/current?lon=' + lon + '&lat=' + lat;

class WeatherInfo {

	constructor() {
		this.lat = 0;
		this.lon = 0;
		this.day = new Date().toDateString().replace( /(\w{3}\s)(.+)/, '$2');
		this.time = new Date().toTimeString().replace( /(\d{2}:\d{2})(.+)/, '$1');
		this.tempSystem = 'Celsius';
		this.dayPart = 'day';
		this.weather = 'clear';
	}
	
	
	findUser() {
		let lat = this.lat;
		let lon = this.lon;
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition ( 
				(position) => {			
					lat = position.coords.latitude;
					lon = position.coords.longitude;
					this.calcPosition(lat, lon);
			}, 
				(error) => {
					fetch("https://ipinfo.io/json")
						.then( (response) => {
							if (response.status !== 200) {
								console.log("Here is not OK, here is " + response.status)
								return;
							}
							response.json().then( (data) => {
								lat = data.loc.split(',')[0];
								lon = data.loc.split(',')[1];
								this.calcPosition(lat, lon);
							});
						}
					).catch( (err) => {
						console.log('Houston, we have a problem');
					});
			})			
		}		
		else {
			document.querySelector('#geo').innerHTML = 'Update your browser';
			return;
		}
		
	}	
		
	
	calcPosition(lat, lon) {
		let url = 'https://fcc-weather-api.glitch.me/api/current?lon=' + lon + '&lat=' + lat;
		
		fetch(url)
		  .then( (response) => {
				if (response.status !== 200) {
					document.querySelector('#geo').innerHTML = 'Houston, we have a problem. Status Code: ' +	response.status;
					return;
				}
				response.json().then( (data) => {
					if(data.name == "Earth") data.name = "Tellus";
					
					//(0°C × 9/5) + 32 = 32°F					
					let temp = data.main.temp;
					
					document.querySelector('#switchTemp').addEventListener('click', (event) => {
						this.tempSystem = (this.tempSystem == 'Celsius') ? 'Fahrenheit' :'Celsius';
						event.target.innerHTML = this.tempSystem;
						temp = (this.tempSystem == 'Celsius') ? data.main.temp : (data.main.temp * 9 / 5 + 32);
						document.querySelector('#temp').innerHTML = temp.toFixed(2);
					})

					document.querySelector('#geo').innerHTML = data.name;
					document.querySelector('#temp').innerHTML = temp.toFixed(2);
					document.querySelector('#wind').innerHTML = data.wind.speed;

					if(data.weather[0].icon) document.querySelector('#icon').innerHTML = "<img src='" + data.weather[0].icon + " ' alt='" + data.weather[0].main + "'>";
					
					
					/* RENDER VIEW IN WINDOW */
					if (data.weather[0].id == 800) this.weather = 'clear'; 
					else if (/^2/.test(data.weather[0].id) ) this.weather = 'thunderstorm';
					else if (/^3/.test(data.weather[0].id) ) this.weather = 'rain';
					else if (/^5/.test(data.weather[0].id) ) this.weather = 'rain';
					else if (/^6/.test(data.weather[0].id) ) this.weather = 'snow';
					else if (/^7/.test(data.weather[0].id) ) this.weather = 'fog';
					else if (/^8/.test(data.weather[0].id) ) this.weather = 'cloud';
					else this.weather = 'clear';
					
					let window = document.querySelector(".weather");
					window.classList.add(this.weather);
										
					let sunrise = data.sys.sunrise * 1000;
					let sunset = data.sys.sunset * 1000;
					let time = new Date().getTime();
					
					if (time < sunrise && sunrise - time > 3600000) {
						window.classList.add('night');
					}
					else if (time < sunrise && sunrise - time < 3600000) {
						window.classList.add('sunrise');
					}
					else if (sunrise < time && time - sunrise < 3600000) {
						window.classList.add('sunrise');
					}
					else if ((sunrise < time && time - sunrise > 3600000) && (time < sunset && sunset - time > 3600000) ) {
						window.classList.add('day');
					}
					else if (time > sunset && time - sunset < 3600000) {
						window.classList.add('sunrise');
					}
					else {//if (time > sunset && time - sunset > 3600000) {
						window.classList.add('night');
					}
					
				});
			}
		).catch( (err) => {
			console.log('Fetch Error :-S', err);
		});
	}

	
	showTime(timeId, dataId) {		
		document.querySelector(timeId).innerHTML = this.day;
		document.querySelector(dataId).innerHTML = this.time;
	}
	
	
	renderWeather() {
		
	}
	
}


let info = new WeatherInfo;

info.showTime('#clientDate', '#clientTime');
info.findUser();
info.renderWeather();