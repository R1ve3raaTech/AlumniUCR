const aplicantesService = require('../services/aplicantesService');


// ======================================================
// GET - OBTENER TODOS LOS APLICANTES
// ======================================================
const obtenerAplicantes = async (req, res, next) => {
    try {

        const aplicantes = await aplicantesService.obtenerAplicantes();

        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes obtenidos correctamente'
        });

    } catch (error) {
        next(error);
    }
};



// ======================================================
// GET - OBTENER APLICANTE POR ID
// ======================================================
const obtenerAplicantePorId = async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }


        const aplicante = await aplicantesService.obtenerAplicantePorId(id);


        if (!aplicante) {
            return res.status(404).json({
                success: false,
                message: 'Aplicante no encontrado'
            });
        }


        return res.json({
            success: true,
            data: aplicante,
            message: 'Aplicante obtenido correctamente' 
        });


    } catch (error) {
        next(error);
    }
};




// ======================================================
// POST - CREAR APLICANTE
// ======================================================
const crearAplicante = async (req, res, next) => {

    try {

        const {
            id_usuario,
            id_empleo,
            estado
        } = req.body;



        if (!id_usuario || !id_empleo) {

            return res.status(400).json({
                success: false,
                message: 'id_usuario e id_empleo son requeridos'
            });

        }


        const nuevoAplicante =
            await aplicantesService.crearAplicante({

                id_usuario,
                id_empleo,
                estado: estado ?? 'pendiente'

            });



        return res.status(201).json({

            success: true,
            data: nuevoAplicante,
            message: 'Aplicante creado correctamente'

        });


    } catch (error) {

        next(error);

    }

};




// ======================================================
// PUT - ACTUALIZAR APLICANTE
// ======================================================
const actualizarAplicante = async (req, res, next) => {

    try {

        const { id } = req.params;

        if (!id) {

            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });

        }


        const datosActualizar = {
            ...req.body
        };


        if (Object.keys(datosActualizar).length === 0) {

            return res.status(400).json({
                success:false,
                message:'No hay datos para actualizar'
            });

        }



        const actualizado =
            await aplicantesService.actualizarAplicante(
                id,
                datosActualizar
            );



        return res.json({

            success:true,
            data: actualizado,
            message:'Aplicante actualizado correctamente'

        });


    } catch(error){

        next(error);

    }

};




// ======================================================
// DELETE - ELIMINAR APLICANTE
// ======================================================
const eliminarAplicante = async (req,res,next)=>{

    try{

        const {id}=req.params;


        if(!id){

            return res.status(400).json({
                success:false,
                message:'El ID es requerido'
            });

        }



        await aplicantesService.eliminarAplicante(id);



        return res.json({

            success:true,
            message:'Aplicante eliminado correctamente'

        });



    }catch(error){

        next(error);

    }

};




// ======================================================
// GET - POR EMPLEO
// ======================================================
const obtenerAplicantesPorEmpleo = async(req,res,next)=>{

    try{

        const {idEmpleo}=req.params;


        const aplicantes =
            await aplicantesService.obtenerAplicantesPorEmpleo(idEmpleo);



        return res.json({

            success:true,
            data:aplicantes,
            message:'Aplicantes obtenidos correctamente'

        });


    }catch(error){

        next(error);

    }

};




// ======================================================
// GET - POR USUARIO
// ======================================================
const obtenerAplicantesPorUsuario = async(req,res,next)=>{

    try{

        const {idUsuario}=req.params;



        const aplicantes =
            await aplicantesService.obtenerAplicantesPorUsuario(idUsuario);



        return res.json({

            success:true,
            data:aplicantes,
            message:'Aplicantes obtenidos correctamente'

        });



    }catch(error){

        next(error);

    }

};




module.exports = {

    obtenerAplicantes,
    obtenerAplicantePorId,
    crearAplicante,
    actualizarAplicante,
    eliminarAplicante,
    obtenerAplicantesPorEmpleo,
    obtenerAplicantesPorUsuario

};
