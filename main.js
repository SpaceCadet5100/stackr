import {getWeather} from './weather_api.js'

const Tetrinos = {
	L:[
	[0, 0, 1, 0],
	[1, 1, 1, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]],	
	O:[
	[1, 1, 0, 0],
	[1, 1, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]], 
	I:[
	[1, 1, 1, 1],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]],
	Z:[
	[0, 1, 1, 0],
	[1, 1, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]],
	T:[ 
	[1, 1, 1, 0],
	[0, 1, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]]	
}

const Packages = {
	COLD: "blue",
	VOLITALE: "yellow",
	GENERAL: "orange",
	PARCEL: "purple",
	COURIER: "red"
}

const PackageStates = {
	B: "not selected",
	I: "selected"
}

function
click()
{
	this.handlers = []
}

click.prototype = 
{
	subscribe: function (fn) {
		this.handlers.push(fn);
	},
	
	unsubscribe: function (fn) {
		this.handlers = this.handlers.filter(
			function (item) {
				if (item !== fn) {
					return item;
				}
			}
		);
	},

	fire: function (o) {
		this.handlers.forEach(function (item) {
			item.update(o);
		});
	}
}


function 
createElement(tag, className) 
{
	const element = document.createElement(tag);
	if (className) element.classList.add(className);
	return element;
}

function 
getElement(selector) 
{
	const element = document.querySelector(selector);
	return element;
}

function
bindElement(element, obj)
{
	element.addEventListener('click', event => {
		event.preventDefault();
		obj.call(_this);
	})
}

function 
truck(x, y, type, action, delay)
{
	this.x = x; 
	this.y = y;
	this.type = type;
	this.action = action;
	this.delay = delay;
	this.array = [...Array(this.y)].map(x=>Array(this.x).fill(undefined))    
}

truck.prototype = {
	tryAddPackage: function(pkg){
		if (this.type === pkg.type){
		for (let i = 0; i < this.x; i++) {
			for(let j = 0; j < this.y; j++)
			{
				if(this.array[j][i] === undefined){
					this.array[j][i] = pkg;
					return true;
				}
			}
		}
		}
		return false;
	}
}

function
pkg(shape, type)
{
	this.shape = shape;
	this.type = type;
	this.state = PackageStates["B"];
}

pkg.prototype = {
	changeState: function(state){
	this.state = state;
	}
}
function 
belt()
{
	this.x = new Array(5);
}

belt.prototype = {
	tryAddPackage: function(shape, type){
		if(this.x[0] === undefined) this.x[0] = new pkg(shape, type); 
	},

	push: function(){
	if(this.x.length > 0 && this.x[this.x.length - 1] === undefined)
		{
		   let last = this.x.pop();
		   this.x.unshift(last);
		}
	}
}

function 
hall()
{
	this.belts = [];
	this.trucks = [];
	this.weather = 0;
	this.clk = new click();
	setInterval(this.pushBelts.bind(this), 1000);
	setInterval(this.addPackage.bind(this), 500);
}

hall.prototype = {
	addBelt: function() {
		this.belts.push(new belt());
		this.clk.fire(this);
	},

	addPackage: function() {
		if(this.belts.length > 0) {
			let tetrinos = Object.keys(Tetrinos);
			let packages = Object.keys(Packages);
			let randomShape = Math.floor(Math.random() * tetrinos.length);	
			let randomType = Math.floor(Math.random() * packages.length);	
			this.belts[Math.floor(Math.random() * this.belts.length)].
				tryAddPackage(tetrinos[randomShape], packages[randomType]);
			this.clk.fire(this);
		}
	},

	setWeather: function(lon, lan, callback){
		getWeather(lon, lan).then(r => {
			this.weather = (r === undefined) ? 0 : r; 
			callback();
		});
	},

	removeTruck: function(truck) {
		if(!(truck.type === 'COLD' && this.weather >= 35)){
			this.trucks.splice(this.trucks.indexOf(truck), 1);
			this.clk.fire(this);
		}
	},

	addTruck: function(x, y, type, action, delay) {
		let _truck = new truck(x, y, type, action, delay);
		setTimeout(function(){
			this.trucks.push(_truck);
			this.clk.fire(this);
		}.bind(this), _truck.delay * 1000);
	},

	removeBelt: function() {
		this.belts.pop();
		this.clk.fire(this);
	},


	pushBelts: function() {
		this.belts.forEach((belt) => {
			belt.push();
		});
	},

	getSelectedPackage: function() {
		return this.getSelectedBand().find(pkg => pkg != undefined 
			&& pkg.state === PackageStates['I']);
	},

	getSelectedBand: function() {
		return this.belts.filter(belt => belt.x.some((pkg) => pkg != undefined 
			&& pkg.state === PackageStates['I']))[0].x;
	},

	subscribe: function(obj) {
		this.clk.subscribe(obj.gui.vhall);
		this.clk.fire(this);
	},

	unsubscribe(obj) {
		this.clk.unsubscribe(obj.gui.vhall);
	}
}

function 
vbelt(belt)
{
	this.draw(belt);
}

vbelt.prototype = {
	draw: function(belt) {
		let _belt = document.createElement('div');
		_belt.className = 'belt';
		_belt.id = "b" + belt.id;

		let belts = document.getElementById('belts');
		let row = document.createElement('div');
		row.className = 'row';
		for(let x = 0; x < belt.x.length; x++)
		{
			let cell = document.createElement('div');
			cell.className = 'col';
			cell.id = x;
			if (belt.x[x] != null) {
				let _vpkg = new vpkg(belt.x[x]);
				if (x === 4) {
					_vpkg.html.draggable = true;
					_vpkg.html.addEventListener("dragstart", function(event){
						belt.x[x].changeState(PackageStates["I"]);
					});
				}
				cell.appendChild(_vpkg.html);
			}
			row.appendChild(cell);

		}
		_belt.appendChild(row);
		belts.appendChild(_belt);
	},
}

function
vtruck(_truck, hall)
{
	this.draw(_truck, hall);
}

vtruck.prototype = {

	draw: function(itruck, hall){
	let parking = document.getElementById('parking');
		let _truck = document.createElement('div');
		_truck.className = 'truck';
		for(let y = 0; y < itruck.y; y++)
		{
			let row = document.createElement('div');
			row.className = 'trow';
			row.id = y;
			for(let x = 0; x < itruck.x; x++)
			{
				let cell = document.createElement('div');
				cell.className = 'tcol';
				if (itruck.array[y][x] != undefined){
					let _vpkg = new vpkg(itruck.array[y][x]);
					cell.appendChild(_vpkg.html);
				}
				else
					cell.style.backgroundColor = "black";
				cell.id = x;
				row.appendChild(cell);
			}
		_truck.appendChild(row);
		}
		let _truckinfo = document.createElement('div', "tinfo");
		_truckinfo.textContent = "Type: " + itruck.type.toLowerCase() 
			+ " | Color: " + Packages[itruck.type];
		_truck.appendChild(_truckinfo);
		let departBtn = createElement("button");
		departBtn.textContent = "Depart";

		departBtn.addEventListener("click", function(event){
			event.preventDefault();
			_this.tryRemoveTruck(itruck);
		});

		_truck.appendChild(departBtn);

		_truck.addEventListener("dragover", function(event){
			event.preventDefault();
		});

		_truck.addEventListener("drop", function(event){
			event.preventDefault();
			_this.tryAddPackage(itruck);
		});
		parking.appendChild(_truck);
	},
}

function 
vpkg(pkg)
{
	this.html = this.draw(pkg);
}

vpkg.prototype = {
	draw: function(pkg){
		let map = Tetrinos[pkg.shape];
		let vpackage = document.createElement('div');
		vpackage.className = 'package';
		for(let y = 0; y < 4; y++)
		{
			let row = document.createElement('div');
			row.className = 'prow';
			row.id = y;
			for(let x = 0; x < 2; x++)
			{
				let cell = document.createElement('div');
				cell.className = 'pcol';
				cell.id = x;
				if(map[x][y] == 1)
				cell.style.backgroundColor = Packages[pkg.type];
				else 
					cell.style.backgroundColor = "black";
				row.appendChild(cell);
			}
		vpackage.appendChild(row);
		}
		return vpackage;
	}
}

function
vhall(hall)
{
	this.draw(hall);
}


vhall.prototype = {
	draw: function(hall){
		Array.from(document.getElementsByClassName('belt'))
			.forEach(belt => { belt.remove(); });
		hall.belts.forEach(belt => new vbelt(belt));

		Array.from(document.getElementsByClassName('truck'))
			.forEach(truck => { truck.remove(); });
		hall.trucks.forEach(truck => new vtruck(truck, hall));
	},

	update: function(obj){
		this.draw(obj);
	}
}

function gui(obj)
{
	this.init(obj);
	this.vhall = new vhall(obj.getCurrentHall());
}

gui.prototype = 
{
	draw: function(hall)
	{
		var elemDiv = document.createElement('div');
		elemDiv.innerHTML = hall;
		document.body.appendChild(elemDiv);
	},
	update: function(eventType, mesg)
	{
		console.log(eventType, mesg);				
	},

	init: function(obj)
	{
	this.packr = getElement('#root')
	this.title = createElement('h3')
	this.title.textContent = 'PACKRR'
	this.hallInfo = createElement('h4')
	this.hallInfo.className = "hallinfo";
	this.hallInfo.textContent = "Hall: 1 | Weather: " + obj.getCurrentHall().weather;
	//this.addTruckBtn = createElement('button')
	//this.addTruckBtn.textContent = 'Add truck'
	this.removeBeltBtn = createElement('button')
	this.removeBeltBtn.textContent = 'Remove Belt'
	this.addBeltBtn= createElement('button')
	this.addBeltBtn.textContent = 'Add belt'
	this.switchHallsBtn = createElement('button')
	this.switchHallsBtn.textContent = 'Switch halls'
	
	this.trucksDiv = createElement('div')
	this.trucksDiv.id = 'parking'
	this.beltsDiv = createElement('div')
	this.beltsDiv.id = 'belts'
	this.hallDiv = createElement('div', 'hall')
	this.hallDiv.append(this.beltsDiv, this.trucksDiv);

	this.truckForm = createElement("form", "truckform");
	this.truckForm.id = "truckform";
	this.lengthLabel = createElement("label");
	this.lengthLabel.innerHTML = "Lenght: ";
	this.lengthInput = createElement("input");
	this.lengthInput.name = "tlength";
	this.lengthInput.min = "1";
	this.lengthInput.max = "5";
	this.lengthInput.type = "number"
	this.lengthInput.setAttribute("required", "");
	this.heightLabel = createElement("label");
	this.heightLabel.innerHTML = "Height: ";
	this.heightInput = createElement("input");
	this.heightInput.name = "theight";
	this.heightInput.min = "1";
	this.heightInput.max  = "3";
	this.heightInput.type = "number"
	this.heightInput.setAttribute("required", "");
	this.delayLabel = createElement("label");
	this.delayLabel.innerHTML = "Delay: ";
	this.delayInput = createElement("input");
	this.delayInput.name = "tdelay";
	this.delayInput.min = "0";
	this.delayInput.type = "number"
	this.delayInput.setAttribute("required", "");
	this.truckTypeLabel = createElement("label");
	this.truckTypeLabel.innerHTML = "Type: ";
	this.truckTypeInput = this.createDropDown(Object.keys(Packages)
); 
	this.truckTypeInput.name = "ttype";
	this.truckTypeInput.setAttribute("required", "");
	this.actionLabel = createElement("label");
	this.actionLabel.innerHTML = "Action radius: ";
	this.actionInput = createElement("input");
	this.actionInput.name = "taction";
	this.actionInput.min = "0";
	this.actionInput.type = "number"
	this.actionInput.setAttribute("required", "");
	this.addTruckBtn = createElement("button"); 
	this.addTruckBtn.value = "submit";
	this.addTruckBtn.innerHTML = "Add truck";
	this.truckForm.append(
		this.lengthLabel,
		this.lengthInput,
		this.heightLabel,
		this.heightInput,
		this.delayLabel,
		this.delayInput,
		this.truckTypeLabel,
		this.truckTypeInput,
		this.actionLabel,
		this.actionInput,
		this.addTruckBtn,
	);

	this.weatherForm = createElement("form", "weatherForm");
	this.weatherForm.id = "weatherform";
	this.lanLabel = createElement("label");
	this.lanLabel.innerHTML = "Latitude: ";
	this.lanInput = createElement("input");
	this.lanInput.name = "lat";
	this.lanInput.min = "-90";
	this.lanInput.max = "90";
	this.lanInput.type = "number"
	this.lanInput.setAttribute("required", "");
	this.lonLabel = createElement("label");
	this.lonLabel.innerHTML = "Longitude: ";
	this.lonInput = createElement("input");
	this.lonInput.name = "lon";
	this.lonInput.min = "-180";
	this.lonInput.max = "180";
	this.lonInput.type = "number"
	this.lonInput.setAttribute("required", "");
	this.changeWeaterBtn = createElement("button"); 
	this.changeWeaterBtn.value = "submit";
	this.changeWeaterBtn.innerHTML = "Change location";
	this.weatherForm.append(
		this.lanLabel,
		this.lanInput,
		this.lonLabel,
		this.lonInput,
		this.changeWeaterBtn
	);

	this.packr.append(
		this.title, 
		this.hallInfo,
		this.addBeltBtn, 
		this.removeBeltBtn,
		this.switchHallsBtn,
		this.truckForm, 
		this.weatherForm,
		this.hallDiv
	);
	bindElement(this.switchHallsBtn, obj.switchHalls);
	bindElement(this.addBeltBtn, obj.addBelt);
	bindElement(this.removeBeltBtn, obj.removeBelt);
	bindElement(this.addTruckBtn, obj.handleAddTruck);
	bindElement(this.changeWeaterBtn, obj.handleChangeWeather);
	},
	
	update: function(obj){
		let hallinfo = getElement(".hallinfo");
		this.hallInfo.textContent = "Hall: " + (obj.currentHallIndex + 1 + 
		" | Weather: " + obj.getCurrentHall().weather);
	},

	clearForm(formId){
		getElement("#" + formId).reset();
	},

	createDropDown(elements){
		let dropdown = createElement("select");
	        for (let item of elements)
		    {
			let option = document.createElement("option");
			option.value = item;
			option.text = item.toLowerCase();
			dropdown.appendChild(option);
		    }
		return dropdown;
	},
	getFormData: function(formId){
		let form = getElement("#" + formId);
		return new FormData(form);
	},
	validateTruckForm: function(formId){
		let form = getElement("#" + formId);
		for( let i = 0; i < 5; i++){
			if(!form[i].checkValidity()){
				form[i].reportValidity();
				return false;
			}
		}
		return true; 
	},
	validateWeatherForm: function(formId){
		let form = getElement("#" + formId);
		for( let i = 0; i < 2; i++){
			if(!form[i].checkValidity()){
				form[i].reportValidity();
				return false;
			}
		}
		return true; 
	}
}

function
stackr()
{
	this.clk = new click();
	this.halls = new Array(new hall(), new hall());
	this.halls[0].setWeather(51, 5, this.updateGui.bind(this));
	this.halls[1].setWeather(1, 1, this.updateGui.bind(this));
	this.currentHallIndex = 0; 
	this.gui = new gui(this);
	this.clk.subscribe(this.gui);
	this.getCurrentHall().subscribe(this);
}

stackr.prototype = 
{
	switchHalls: function()
	{	
		this.getCurrentHall().unsubscribe(this);
		this.currentHallIndex === 0 ? 
			this.currentHallIndex = 1:
			this.currentHallIndex = 0;
		this.getCurrentHall().subscribe(this);
		this.clk.fire(this);
	},

	updateGui: function (){
		this.clk.fire(this);
	},

	addBelt: function()
	{
		this.getCurrentHall().addBelt();
	},

	addPackage: function()
	{
		this.getCurrentHall().addPackage();
	},

	removeBelt: function()
	{
		this.getCurrentHall().removeBelt();
	},

	getCurrentHall: function ()
	{
		return this.halls[this.currentHallIndex];
	},

	tryRemoveTruck: function(truck)
	{
		this.getCurrentHall().removeTruck(truck);
	},
	
	tryAddPackage: function(truck)
	{
		let pkg = this.getCurrentHall().getSelectedPackage();
		if (truck.tryAddPackage(pkg)){
			let band = this.getCurrentHall().getSelectedBand();
			band[4] = undefined; 
		}
		else
			pkg.changeState(PackageStates['B']);
	},

	handleAddTruck: function()
	{
		if(this.gui.validateTruckForm("truckform")){
			let _truck = this.gui.getFormData("truckform");
			this.gui.clearForm("truckform");
			this.getCurrentHall().addTruck(
				parseInt(_truck.get("tlength")),
				parseInt(_truck.get("theight")),
				_truck.get("ttype"),
				parseInt(_truck.get("taction")),
				parseInt(_truck.get("tdelay"))
			);
		}
	},
	handleChangeWeather: function()
	{
		if(this.gui.validateWeatherForm("weatherform")){
			let _weather = this.gui.getFormData("weatherform");
			this.gui.clearForm("weatherform");
			this.getCurrentHall().setWeather(_weather.get("lon"),
				_weather.get("lat"), this.updateGui.bind(this));
		}
	}
}

let _this;
window.onload = _this = new stackr(); 

