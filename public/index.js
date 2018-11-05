var socketIo = io.connect('/', { 'forceNew': true });

$(document).ready(function () {

	$("#hfId").val("");

	socketIo.on('salida', function(data) {
		
		if(data.error != ""){
			MostrarVentana(data.error);
			return;
		}
		
		CargarLibros(data.respuesta);
		$("#hfId").val("");
	});

	

	socketIo.on('libro', function(data) {
		
		if(data.error != ""){
			MostrarVentana(data.error);
			return;
		}
		
		var nombre = data.respuesta[0].nombre;
		var autor = data.respuesta[0].autor;
		
		$("#txtNobre").val(nombre);
		$("#txtAutor").val(autor);
	});

	$("#btnAlmacenar").click(function (e) {
		Almacenar();
		return false;
	});

	$("#btnLimpiar").click(function (e) {
		Limpiar();
		return false;
	});


	$("#txtNobre").keydown(function (e) {
		tecla = (document.all) ? e.keyCode : e.which;
		if (tecla == 13) {
			Almacenar();
			return false;
		}
	});

	$("#txtAutor").keydown(function (e) {
		tecla = (document.all) ? e.keyCode : e.which;
		if (tecla == 13) {
			Almacenar();
			return false;
		}
	});

});

function convertir(datos)
{
	return JSON.parse(JSON.stringify(datos[0]));
}

function CargarLibros(dataSet){
	var t = $('#tbDetalles').DataTable({
	data: dataSet,
	bLengthChange: false,
	ordering: true,
	destroy: true,
	bPaginate: true,
	bFilter: false,
	//bServerSide: false,
	searching: true,
	autoWidth: false,
	info: false,
	
	aoColumns: [
		{ mData: "ID_LIBRO" },
		{ mData: "NOMBRE" },
		{ mData: "AUTOR" },
		{ mData: "FECHA" }
	],
	aoColumnDefs: [
	{
		aTargets: [4],
		bSearchable: false,
		bSortable: false,
		mRender: function (id_campo, type, full, meta) {
			return '<a href="javascript:Editar(' + full.ID_LIBRO + ');" class="btn btn-primary btn-md" style="display:' + '" title="Editar"><span class="glyphicon glyphicon-edit"></span></a>';
		}
	},
	{
		aTargets: [5],
		bSearchable: false,
		bSortable: false,
		mRender: function (id_campo, type, full, meta) {
			return '<a href="javascript:Borrar(' + full.ID_LIBRO + ');" class="btn btn-primary btn-md" style="display:' + '" title="Borrar"><span class="glyphicon glyphicon-edit"></span></a>';
		}
	}
	],
		language: {
			sProcessing: "Procesando...",
			sLoadingRecords: "Cargando...",
			sInfoFiltered: "(filtrando un total de _MAX_ registros)",
			lengthMenu: "Se muestran _MENU_ registros por página",
			sZeroRecords: "No se encontraron resultados",
			sEmptyTable: "Ningún dato disponible en esta tabla",
			info: "Mostrando página _PAGE_ de _PAGES_",
			infoEmpty: "No hay registros disponibles",
			search: "Búsqueda",
			paginate: {
				sFirst: "Primero",
				sLast: "Último",
				previous: "Anterior",
				next: "Siguiente"
			},
			infoFiltered: "(filtered from _MAX_ total records)"
		},
	});


	t.on('order.dt search.dt', function () {
		t.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();
}

function MostrarVentana(texto) {

	$("#spTexto").text(texto);
	$("#spTitulo").html("Nuevo");
	$('#myModal').modal('show');
}

function Limpiar() {

	$("#txtNobre").val("");
	$("#txtAutor").val("");
	$("#hfId").val("");
	$("#txtNobre").focus();
}

function Almacenar() {

	var nombre = $("#txtNobre").val().trim();
	var autor = $("#txtAutor").val().trim();

	if (nombre == "") {
		MostrarVentana("Ingrese nombre");
		return;
	}

	if (autor == "") {
		MostrarVentana("Ingrese autor");
		return;
	}

	var id = $("#hfId").val().trim() == "" ? 0 : parseInt($("#hfId").val().trim());

	socketIo.emit("almacenar", {
		id: id,
		nombre:nombre,
		autor:autor
	});

	Limpiar();
}

function Editar(id){

	$("#hfId").val(id);

	socketIo.emit("editar", {
		id:id
	});
}

function Borrar(id){

	socketIo.emit("borrar", {
		id:id
	});

}


