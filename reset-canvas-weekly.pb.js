// Weekly canvas reset endpoint
routerAdd("POST", "/api/reset-canvas-weekly", (e) => {
  try {
    // Find all canvas records
    const records = $app.findRecordsByFilter(
      "canvas",
      "id != ''",
      "-created",
      500
    );

    // Reset each canvas record
    records.forEach((record) => {
      record.set("pixels", "");
      $app.save(record);
    });

    e.json(200, {
      success: true,
      message: "Canvas reset successfully",
      count: records.length
    });
  } catch (err) {
    e.json(500, {
      success: false,
      error: err.message
    });
  }
}, $apis.requireSuperuserAuth());
