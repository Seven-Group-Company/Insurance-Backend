export class SendResponse {
  "200" = (res, data = null, error = null) => {
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Operation Successfull",
      data: data,
      error: error,
    });
  };
  "404" = (res, message, data = null, error = null) => {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message,
      data: data,
      error: error,
    });
  };
  "400" = (res, message, data = null, error = null) => {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message,
      data: data,
      error: error,
    });
  };
  "401" = (res, message, data = null, error = null) => {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message,
      data: data,
      error: error,
    });
  };
  "500" = (res, error = null) => {
    res.status(500).json({
      success: false,
      statusCode: 404,
      message: "Operation Failed",
      data: null,
      error: error,
    });
  };
}
