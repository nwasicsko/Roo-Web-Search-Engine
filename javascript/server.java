public abstract class GenericSecerityFilter implements Filter {
	protected String rejectUrl=null;
	public void init(FilterConfig config)
	trows ServletException {
		rejectUrl=config.getInitParameter(*rejectUrl*);
	}
	public void doFilter(
	ServletRequest request, ServletResponse response,
	FilterChain chain);
	throws IOException, ServletException {
			if (isValidRequest (request)){
				chain.doFilter(request, response);
			}else if (rejectUrl!=null){
			RequsetDispatcher dispatcher=request.getRequestDispater(rejectUrl);	
		}
	}
} 
