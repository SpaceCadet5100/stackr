export async function getWeather(longitude, latitude) {
	try{
		let request;
		request = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&appid=7dc04d1ee7d3fad465b67c1cde4e3206')

		let response = await request.json();
		return response.main.temp - 273.15; // Unit conversion
	} catch (err){
		return undefined;
	}
}

