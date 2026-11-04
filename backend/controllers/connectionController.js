const Connection = require("../models/Connection")

//manufacturer sending request to supplier
const sendConnectionRequest = async (req, res) => {
  try {
    const { supplierId } = req.body

    if (!supplierId) {
      return res.status(400).json({ message: "Supplier ID is required" })
    }

    const existing = await Connection.findOne({
      manufacturer: req.user.id,
      supplier: supplierId
    })

    if (existing) {
      if (existing.status === "rejected") {
        existing.status = "pending"
        await existing.save()

        return res.status(200).json({
          message: "Connection request sent again",
          connection: existing
        })
      }

      return res.status(400).json({
        message: "Connection request already exists",
        status: existing.status
      })
    }

    const connection = await Connection.create({
      manufacturer: req.user.id,
      supplier: supplierId
    })

    return res.status(201).json({
      message: "Connection request sent successfully",
      connection
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}

//show the pending requests to supplier
const getSupplierRequests = async (req, res) => {
    try {
        const requests = await Connection.find({
            supplier: req.user.id,
            status: "pending"
        }).populate("manufacturer", "name email")

        res.status(200).json({requests})

    } catch (error) {
        res.status(500).json({message: "Server error",error: error.message})
    }
}


// to change the status of the request from pending to accepted/rejected
const updateConnectionStatus = async (req, res) => {
    try {
        const { connectionId, status } = req.body;

        if (!connectionId || !status) {
            return res.status(400).json({message: "Connection ID and status are required"})
        }

        if (status !== "accepted" && status !== "rejected") {
            return res.status(400).json({message: "Status must be accepted or rejected"})
        }

        const connection = await Connection.findOne({
            _id: connectionId,
            supplier: req.user.id,
            status: "pending"
        })

        if (!connection) {
            return res.status(404).json({message: "Connection request not found"})
        }

        connection.status = status 
        await connection.save()

        res.status(200).json({message: `Connection request ${status}`,connection})

    } catch (error) {
        res.status(500).json({message: "Server error",error: error.message})
    }
}


const getMySuppliers = async (req, res) => {
    try {
        const connections = await Connection.find({
            manufacturer: req.user.id,
            status: "accepted"
        }).populate("supplier", "name email");

        res.status(200).json({suppliers: connections});

    } catch (error) {
        res.status(500).json({message: "Server error",error: error.message});
    }
}


//manufacturer ki sent requests aur unke statuses milenge
const getMyConnectionRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      manufacturer: req.user.id
    }).select("supplier status createdAt")

    res.status(200).json({ requests })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}



const getMyManufacturers = async (req, res) => {
  try {
    const connections = await Connection.find({
      supplier: req.user.id,
      status: "accepted"
    }).populate("manufacturer", "name email");

    res.status(200).json({ manufacturers: connections });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports={sendConnectionRequest , getSupplierRequests , updateConnectionStatus , getMySuppliers , getMyConnectionRequests,
  getMyManufacturers
}