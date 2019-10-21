var update_qtm_mapping = (wemos_uuid) => {
        $.post("http://127.0.0.1:5000/updateDevice",{
          uuid: wemos_uuid,
          value: document.getElementById(wemos_uuid).value
        },
        function(data, status){
          alert("Data: " + data + "\nStatus: " + status);
        });
}