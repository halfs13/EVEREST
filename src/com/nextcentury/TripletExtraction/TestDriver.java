package com.nextcentury.TripletExtraction;

import java.util.Date;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.Logger;

import edu.stanford.nlp.ling.CoreAnnotations.SentencesAnnotation;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.trees.Tree;
import edu.stanford.nlp.trees.TreeCoreAnnotations.TreeAnnotation;
import edu.stanford.nlp.util.CoreMap;

public class TestDriver {

	private static Logger log = Logger.getLogger(TestDriver.class);

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		//testParser();
		testExtraction();
	}
	
	private static void testExtraction() {
		ExtractionService extractor = new ExtractionService();
		extractor.checkParserFeedback();
	}
	
	private void testParser() {
		log.debug("Running test driver!");

		Properties props = new Properties();
		props.put("annotators", "tokenize, ssplit, parse");
		StanfordCoreNLP pipeline = new StanfordCoreNLP(props);

		String text = "Robert Joseph 'Bob' Dole is an American politician who represented Kansas in the United States Senate from 1969 to 1996 and the House of Representatives from 1961 to 1969. In the 1976 presidential election, he was the Republican Party nominee for Vice President and incumbent President Gerald Ford's running mate. In the presidential election of 1996, he was the Republican nominee for President against incumbent Bill Clinton.";
		Annotation document = new Annotation(text);
		log.info(new Date());
		pipeline.annotate(document);
		log.info(new Date());

		List<CoreMap> sentences = document.get(SentencesAnnotation.class);

		for(CoreMap sentence: sentences) {
			Tree tree = sentence.get(TreeAnnotation.class);
			log.info("Tree: " + tree.toString());
		}
	}

}
