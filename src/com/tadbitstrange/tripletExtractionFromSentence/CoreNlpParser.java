package com.tadbitstrange.tripletExtractionFromSentence;

import java.util.ArrayList;
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

/**
 * @author 	Josh Williams
 * @date	10Jun2013
 */
public class CoreNlpParser {

	private static Logger log = Logger.getLogger(TestDriver.class);
	Properties props;
	StanfordCoreNLP pipeline;
	
	/**
	 * Default constructor
	 * 
	 * Creates a generic CoreNLP instance to annotate with the tokenize, split
	 * and parse options.
	 */
	public CoreNlpParser() {
		props = new Properties();
		props.put("annotators", "tokenize, ssplit, parse");
		pipeline = new StanfordCoreNLP(props);
	}
	
	/**
	 * Creates a CoreNLP instance to annotate with the specified annotators
	 * 
	 * @param annotatorsString String - comma separated list of annotators to
	 * 		perform when parsing. 
	 */
	public CoreNlpParser(String annotatorsString) {
		props = new Properties();
		props.put("annotators", annotatorsString);
		pipeline = new StanfordCoreNLP(props);
	}
    
	/**
	 * Perform the CoreNLP annotation on the entry string, returning the results
	 * as a List of {@link CoreMap} objects corresponding to each sentence.
	 *  
	 * @param entryString String - The string to be annotated
	 * @return List - List of {@link CoreMap} objects, each corresponding to
	 * 		one sentence of the entryString parameter.
	 * @see edu.stanford.nlp.util.CoreMap
	 */
	private List<CoreMap> annotate(String entryString) {
		Annotation document = new Annotation(entryString);
	    
	    long startMilli = new Date().getTime();
	    pipeline.annotate(document);
	    long diffTime = new Date().getTime() - startMilli;
	    log.debug("Parsing took " + diffTime + "ms");
	    
	    List<CoreMap> sentences = document.get(SentencesAnnotation.class);
	    
	    return sentences;
	}
	
	/**
	 * Return the CoreNLP annotated and parsed result of the entryString as a
	 * String
	 * 
	 * @param entryString String - The string to be processed
	 * @return String - the flattened tree returned by {@link #annotate(String) annotate}
	 */
	public String parseToString(String entryString) {
		List<CoreMap> sentences = annotate(entryString);
		
		String ret = "";
	     
	    for(CoreMap sentence: sentences) {
	    	Tree tree = sentence.get(TreeAnnotation.class);
	    	ret = ret + tree.toString() + " ";
	    }
	    
	    return ret;
	}
	
	/**
	 * Return the CoreNLP annotated and parsed result of the entryString as a
	 * ArrayList of {@link Tree} objects
	 * 
	 * @param entryString String - The string to be processed
	 * @return ArrayList - ArrayList containing {@link Tree} objects
	 * 		representing each string
	 */
	public ArrayList<Tree> parse(String entryString) {
		List<CoreMap> sentences = annotate(entryString);
	    
	    ArrayList<Tree> ret = new ArrayList<Tree>();
	     
	    for(CoreMap sentence: sentences) {
	    	Tree tree = sentence.get(TreeAnnotation.class);
	    	ret.add(tree);
	    }
	    
	    return ret;
	}
}
