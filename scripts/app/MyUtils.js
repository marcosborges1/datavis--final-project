class MyUtils {

	static includeHTML() {

	  $("div[data-includeHTML]").each(function () {                
	      $(this).load($(this).attr("data-includeHTML"));
	  }) 
	}

}