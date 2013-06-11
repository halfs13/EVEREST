package com.nextcentury.TripletExtraction;

import org.apache.log4j.Logger;

import edu.stanford.nlp.trees.Tree;

public class ExtractionService {
	
	private static Logger log = Logger.getLogger(ExtractionService.class);
	CoreNlpParser parser;
	
	public ExtractionService() {
		parser = new CoreNlpParser();
	}
	
	public void checkParserFeedback() {
		Tree tree = parser.parse("My dog has fleas").get(0);
		log.info(tree.label());
		log.info(tree.children()[0].label());
		log.info(tree.children()[0].children()[0].label());
	}
	
	public void tripletExtraction(String s) {
		extractSubject();
		extractPredicate();
		extractObject();
	}
	
	public void extractAttributes(String s, String word) {
		
	}
	
	public void extractSubject() {
		
	}
	
	public void extractPredicate() {
		
	}
	
	public void extractObject() {
		
	}
}
