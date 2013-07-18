# TripletExtraction


Ant targets:

clean - removes build, target and downloads (downloads should be autocleaned anyway)

getDependencies - gets stanford corenlp and log4j

jar - builds the jar
	-- need to provide:
		-Dmain_path=[path to main class for executing the jar independently] 
					(the only main currently existing is at com.nextcentury.TripletExtraction.TestDriver)
		-Djar_name=[base name of resulting package] (dont include the .jar.... defaults to package resulting in package.jar)
